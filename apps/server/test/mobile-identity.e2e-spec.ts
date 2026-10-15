import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { createApplication } from '../src/app.module.js';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { hashSecret } from '../src/modules/identity/identity.repository.js';
import { holdDatabase, testDatabase } from './helpers.js';
import type { components } from '@holdlog/contracts/http';
type Session = components['schemas']['MobileSession'];
type Challenge = components['schemas']['LoginChallenge'];
type Login = components['schemas']['LoginResult'];

void test('HTTP mobile identity: proof isolation, signup, relogin, profile version/idempotency, rotation and logout', async () => {
  const { config, db, close } = testDatabase();
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
  try {
    const result = await login(); assert.equal(result.kind, 'signup_required');
    if (result.kind !== 'signup_required') throw new Error('Expected signup proof');
    const token = result.signup.signupToken;
    assert.equal((await request('/me', 'GET', undefined, token)).response.status, 401);
    assert.equal((await request('/auth/sessions/refresh', 'POST', { refreshToken: token, deviceId })).response.status, 401);
    assert.equal(db.prepare('SELECT id FROM external_identities WHERE provider_subject=?').all(subject).length, 0);
    for (const name of ['', ' \t\n']) assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId, name })).response.status, 400);
    assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId: randomUUID(), name: 'fixture' })).response.status, 401);
    assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId, name: 'fixture', extra: true })).response.status, 400);
    const signup = await request('/auth/signups', 'POST', { signupToken: token, deviceId, name: '  회원  ' });
    assert.equal(signup.response.status, 201); const session = signup.body as unknown as Session;
    const accountId = session.profile.id; assert.equal(session.profile.name, '회원');
    assert.equal((await request('/auth/signups', 'POST', { signupToken: token, deviceId, name: 'again' })).response.status, 401);
    const again = await login(); assert.equal(again.kind, 'authenticated');
    if (again.kind === 'authenticated') assert.equal(again.session.profile.id, accountId);
    const profile = await request('/me', 'GET', undefined, session.accessToken); assert.equal(profile.response.status, 200); assert.equal(profile.response.headers.get('etag'), '"1"');
    assert.equal((await request('/me', 'PATCH', { name: 'rename' }, session.accessToken)).response.status, 428);
    assert.equal((await request('/me', 'PATCH', { name: 'rename', extra: true }, session.accessToken, { 'If-Match': '"1"' })).response.status, 400);
    const key = randomUUID();
    const edited = await request('/me', 'PATCH', { name: 'rename' }, session.accessToken, { 'If-Match': '"1"', 'Idempotency-Key': key });
    assert.equal(edited.response.status, 200); assert.equal(edited.body.version, 2);
    // An upper-case spelling of the same request key replays the stored result.
    const replay = await request('/me', 'PATCH', { name: 'rename' }, session.accessToken, { 'If-Match': '"1"', 'Idempotency-Key': key.toUpperCase() });
    assert.equal(replay.response.status, 200); assert.equal(replay.body.version, 2);
    assert.equal((await request('/me', 'PATCH', { name: 'different' }, session.accessToken, { 'If-Match': '"1"', 'Idempotency-Key': key })).response.status, 409);
    assert.equal((await request('/me', 'PATCH', { name: 'stale' }, session.accessToken, { 'If-Match': '"1"' })).response.status, 412);
    const rotated = await request('/auth/sessions/refresh', 'POST', { refreshToken: session.refreshToken, deviceId: deviceId.toUpperCase() }); assert.equal(rotated.response.status, 200);
    const newSession = rotated.body as unknown as Session; assert.notEqual(newSession.refreshToken, session.refreshToken);
    assert.equal((await request('/auth/sessions/refresh', 'POST', { refreshToken: session.refreshToken, deviceId })).response.status, 401);
    assert.equal((await request('/me', 'GET', undefined, newSession.accessToken)).response.status, 401);
    if (again.kind !== 'authenticated') throw new Error('Expected session');
    assert.equal((await request('/auth/sessions/current', 'DELETE', undefined, again.session.accessToken)).response.status, 200);
    assert.equal((await request('/me', 'GET', undefined, again.session.accessToken)).response.status, 401);
    assert.equal(db.prepare('SELECT id FROM accounts WHERE id=?').all(accountId).length, 1);
    assert.equal(db.prepare<[string], { account_id: string | null }>('SELECT account_id FROM device_installations WHERE id=?').get(deviceId)?.account_id, null);
    const secrets = db.prepare<[string], { token_hash: string }>('SELECT token_hash FROM access_credentials WHERE session_id IN (SELECT id FROM auth_sessions WHERE account_id=?)').all(accountId);
    assert.ok(secrets.length > 0 && secrets.every(row => /^[a-f0-9]{64}$/.test(row.token_hash)));
  } finally { await app.close(); close(); }
});

void test('challenge is single-use and provider validation failure leaves it available', async () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(); let reject = true;
  const service = new IdentityService(db, { verify: input => reject ? Promise.reject(new Error('unsafe provider detail')) : Promise.resolve({ provider: input.provider, subject, email: null }) });
  try {
    const challenge = await service.challenge();
    const input = { provider: 'google' as const, challengeId: challenge.challengeId.toUpperCase(), idToken: 'fixture', deviceId: randomUUID(), authorizationCode: null };
    await assert.rejects(service.login(input)); reject = false;
    const results = await Promise.allSettled([service.login(input), service.login(input)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(db.prepare('SELECT id FROM signup_proofs WHERE provider_subject=?').all(subject).length, 1);
    assert.equal(db.prepare<[string], { consumed: number }>('SELECT consumed_at IS NOT NULL AS consumed FROM login_challenges WHERE id=?').get(challenge.challengeId)?.consumed, 1);
    assert.ok(hashSecret(challenge.nonce));
  } finally { close(); }
});

void test('a write lock held past the busy timeout returns retryable 503 TEMPORARY_FAILURE', { timeout: 30_000 }, async () => {
  const { config, close } = testDatabase();
  const app = await createApplication(config, { verify: () => Promise.reject(new Error('unused')) });
  await app.listen(0, '127.0.0.1');
  try {
    // Hold 8 s against the 5 s busy timeout: the insert gives up first even on a slow machine, then SQLITE_BUSY maps to the generic retryable failure.
    const holder = await holdDatabase(config.databasePath, 8000);
    const response = await fetch(await app.getUrl() + '/api/v2/auth/challenges', { method: 'POST', headers: { 'Idempotency-Key': randomUUID() } });
    assert.equal(response.status, 503);
    const body = await response.json() as { code: string; retryable: boolean };
    assert.equal(body.code, 'TEMPORARY_FAILURE'); assert.equal(body.retryable, true);
    assert.deepEqual(await holder.exited, [0, null]);
  } finally { await app.close(); close(); }
});
