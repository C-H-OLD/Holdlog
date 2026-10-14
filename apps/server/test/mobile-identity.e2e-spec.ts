import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { integrationConfiguration } from './helpers.js';
import { createApplication } from '../src/app.module.js';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { hashSecret } from '../src/modules/identity/identity.repository.js';
import type { components } from '@holdlog/contracts/http';
type Session = components['schemas']['MobileSession'];
type Challenge = components['schemas']['LoginChallenge'];
type Login = components['schemas']['LoginResult'];

void test('HTTP mobile identity: proof isolation, signup, relogin, profile version/idempotency, rotation and logout', async () => {
  const config = integrationConfiguration(), pool = createDatabase(config);
  await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID();
  const app = await createApplication(config, { verify: input => Promise.resolve({ provider: input.provider, subject, email: 'fixture@example.invalid' }) });
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  /** Send a synthetic JSON request and retain HTTP metadata for contract assertions. */
  async function request(path: string, method = 'POST', body?: unknown, token?: string, extra: Record<string, string> = {}) {
    const response = await fetch(base + '/api/v2' + path, { method, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { response, body: await response.json() as Record<string, unknown> };
  }
  /** Obtain a fresh proof or existing session through the same HTTP login endpoint. */
  async function login(provider = 'google'): Promise<Login> {
    const challenge = (await request('/auth/challenges')).body as unknown as Challenge;
    const result = await request('/auth/sessions', 'POST', { provider, idToken: 'synthetic-provider-token', challengeId: challenge.challengeId, deviceId, authorizationCode: null });
    assert.equal(result.response.status, 200, JSON.stringify(result.body));
    return result.body as unknown as Login;
  }
  let accountId: string | undefined;
  try {
    const result = await login(); assert.equal(result.kind, 'signup_required');
    if (result.kind !== 'signup_required') throw new Error('Expected signup proof');
    const token = result.signup.signupToken;
    assert.equal((await request('/me', 'GET', undefined, token)).response.status, 401);
    assert.equal((await request('/auth/sessions/refresh', 'POST', { refreshToken: token, deviceId })).response.status, 401);
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 0);
    for (const name of ['', ' \t\n']) assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId, name })).response.status, 400);
    assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId: randomUUID(), name: 'fixture' })).response.status, 401);
    assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId, name: 'fixture', extra: true })).response.status, 400);
    const signup = await request('/auth/signups', 'POST', { signupToken: token, deviceId, name: '  회원  ' });
    assert.equal(signup.response.status, 201); const session = signup.body as unknown as Session;
    accountId = session.profile.id; assert.equal(session.profile.name, '회원');
    assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId, name: 'again' })).response.status, 401);
    const again = await login(); assert.equal(again.kind, 'authenticated');
    if (again.kind === 'authenticated') assert.equal(again.session.profile.id, accountId);
    const profile = await request('/me', 'GET', undefined, session.accessToken); assert.equal(profile.response.status, 200); assert.equal(profile.response.headers.get('etag'), '"1"');
    assert.equal((await request('/me', 'PATCH', { name: 'rename' }, session.accessToken)).response.status, 428);
    assert.equal((await request('/me', 'PATCH', { name: 'rename', extra: true }, session.accessToken, { 'If-Match': '"1"' })).response.status, 400);
    const key = randomUUID();
    const edited = await request('/me', 'PATCH', { name: 'rename' }, session.accessToken, { 'If-Match': '"1"', 'Idempotency-Key': key });
    assert.equal(edited.response.status, 200); assert.equal(edited.body.version, 2);
    const replay = await request('/me', 'PATCH', { name: 'rename' }, session.accessToken, { 'If-Match': '"1"', 'Idempotency-Key': key });
    assert.equal(replay.response.status, 200); assert.equal(replay.body.version, 2);
    assert.equal((await request('/me', 'PATCH', { name: 'different' }, session.accessToken, { 'If-Match': '"1"', 'Idempotency-Key': key })).response.status, 409);
    assert.equal((await request('/me', 'PATCH', { name: 'stale' }, session.accessToken, { 'If-Match': '"1"' })).response.status, 412);
    const rotated = await request('/auth/sessions/refresh', 'POST', { refreshToken: session.refreshToken, deviceId }); assert.equal(rotated.response.status, 200);
    const newSession = rotated.body as unknown as Session; assert.notEqual(newSession.refreshToken, session.refreshToken);
    assert.equal((await request('/auth/sessions/refresh', 'POST', { refreshToken: session.refreshToken, deviceId })).response.status, 401);
    assert.equal((await request('/me', 'GET', undefined, newSession.accessToken)).response.status, 401);
    if (again.kind !== 'authenticated') throw new Error('Expected session');
    assert.equal((await request('/auth/sessions/current', 'DELETE', undefined, again.session.accessToken)).response.status, 200);
    assert.equal((await request('/me', 'GET', undefined, again.session.accessToken)).response.status, 401);
    assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [accountId])).rowCount, 1);
    assert.equal((await pool.query<{ account_id: string | null }>('SELECT account_id FROM holdlog.device_installations WHERE id=$1', [deviceId])).rows[0]?.account_id, null);
    const secrets = await pool.query('SELECT token_hash FROM holdlog.access_credentials WHERE session_id IN (SELECT id FROM holdlog.auth_sessions WHERE account_id=$1)', [accountId]);
    assert.ok(secrets.rows.every((row: { token_hash: string }) => /^[a-f0-9]{64}$/.test(row.token_hash)));
  } finally {
    await app.close();
    await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [accountId]);
    await pool.query('DELETE FROM holdlog.device_installations WHERE id=$1', [deviceId]);
    await pool.query('DELETE FROM holdlog.signup_proofs WHERE provider_subject=$1', [subject]);
    await pool.query('DELETE FROM holdlog.request_receipts WHERE principal_id=$1', [accountId]);
    await pool.end();
  }
});

void test('challenge is single-use and provider validation failure leaves it available', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(); let reject = true;
  const service = new IdentityService(pool, { verify: input => reject ? Promise.reject(new Error('unsafe provider detail')) : Promise.resolve({ provider: input.provider, subject, email: null }) });
  try {
    const challenge = await service.challenge();
    const input = { provider: 'google' as const, challengeId: challenge.challengeId, idToken: 'fixture', deviceId: randomUUID(), authorizationCode: null };
    await assert.rejects(service.login(input)); reject = false;
    const results = await Promise.allSettled([service.login(input), service.login(input)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE provider_subject=$1', [subject])).rowCount, 1);
    assert.equal((await pool.query<{ consumed: boolean }>('SELECT consumed_at IS NOT NULL AS consumed FROM holdlog.login_challenges WHERE id=$1', [challenge.challengeId])).rows[0]?.consumed, true);
    assert.ok(hashSecret(challenge.nonce));
  } finally { await pool.query('DELETE FROM holdlog.signup_proofs WHERE provider_subject=$1', [subject]); await pool.end(); }
});
