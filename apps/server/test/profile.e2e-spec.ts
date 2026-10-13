import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type pg from 'pg';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { integrationConfiguration } from './helpers.js';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { hashSecret } from '../src/modules/identity/identity.repository.js';
import type { MobileSession } from '../src/modules/identity/mobile-session.js';

/** Create a synthetic subject and real session, then remove only its fixtures after each boundary test. */
async function fixture(work: (pool: pg.Pool, service: IdentityService, session: MobileSession, subject: string, deviceId: string) => Promise<void>): Promise<void> {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID();
  const service = new IdentityService(pool, { verify: input => Promise.resolve({ provider: input.provider, subject, email: 'same@example.invalid' }) });
  const challenge = await service.challenge();
  const login = await service.login({ provider: 'google', challengeId: challenge.challengeId, idToken: 'fixture', deviceId, authorizationCode: null });
  if (login.kind !== 'signup_required') throw new Error('Expected signup');
  const session = await service.signup({ signupToken: login.signup.signupToken, deviceId, name: 'original' }, randomUUID());
  try { await work(pool, service, session, subject, deviceId); }
  finally {
    await pool.query('DELETE FROM holdlog.request_receipts WHERE principal_id=$1 OR principal_id IN (SELECT id FROM holdlog.signup_proofs WHERE provider_subject=$2)', [session.profile.id, subject]);
    await pool.query('DELETE FROM holdlog.accounts WHERE id IN (SELECT account_id FROM holdlog.external_identities WHERE provider_subject=$1)', [subject]);
    await pool.query('DELETE FROM holdlog.device_installations WHERE id=$1', [deviceId]);
    await pool.query('DELETE FROM holdlog.signup_proofs WHERE provider_subject=$1', [subject]); await pool.end();
  }
}

void test('profile receipt failure preserves name/version; same key retries and stale/blank/photo patches preserve data', () => fixture(async (pool, service, session) => {
  const key = randomUUID();
  await assert.rejects(service.editProfile(session.accessToken, {}, 1, key), { code: 'INVALID_INPUT' });
  await pool.query(`CREATE FUNCTION holdlog.test_profile_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.key='${key}'::uuid THEN RAISE EXCEPTION 'synthetic failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER test_profile_failure BEFORE INSERT ON holdlog.request_receipts FOR EACH ROW EXECUTE FUNCTION holdlog.test_profile_failure()`);
  try {
    await assert.rejects(service.editProfile(session.accessToken, { name: 'changed' }, 1, key));
    assert.deepEqual(await service.getProfile(session.accessToken), session.profile);
  } finally { await pool.query('DROP TRIGGER test_profile_failure ON holdlog.request_receipts; DROP FUNCTION holdlog.test_profile_failure()'); }
  const changed = await service.editProfile(session.accessToken, { name: 'changed' }, 1, key); assert.equal(changed.version, 2);
  await assert.rejects(service.editProfile(session.accessToken, { name: '  ' }, 2, randomUUID()), { code: 'INVALID_INPUT' });
  await assert.rejects(service.editProfile(session.accessToken, { photoFileId: randomUUID() }, 2, randomUUID()), { code: 'INVALID_INPUT' });
  await assert.rejects(service.editProfile(session.accessToken, { name: 'old version' }, 1, randomUUID()), { code: 'VERSION_CONFLICT' });
  assert.deepEqual(await service.getProfile(session.accessToken), changed);
}));

void test('same email and subject from another provider remains a distinct named account', () => fixture(async (pool, service, first, subject, deviceId) => {
  const challenge = await service.challenge();
  const result = await service.login({ provider: 'apple', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
  assert.equal(result.kind, 'signup_required'); if (result.kind !== 'signup_required') throw new Error('Expected proof');
  const second = await service.signup({ signupToken: result.signup.signupToken, deviceId, name: 'second' }, randomUUID());
  assert.notEqual(second.profile.id, first.profile.id);
  assert.equal((await pool.query('SELECT account_id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 2);
}));

void test('access and refresh expiry, installation mismatch and deleted account fail closed', () => fixture(async (pool, service, session, _subject, deviceId) => {
  await assert.rejects(service.refresh({ refreshToken: session.refreshToken, deviceId: randomUUID() }), { code: 'UNAUTHENTICATED' });
  await pool.query("UPDATE holdlog.access_credentials SET expires_at=statement_timestamp()-interval '1 microsecond' WHERE token_hash=$1", [hashSecret(session.accessToken)]);
  await assert.rejects(service.getProfile(session.accessToken), { code: 'UNAUTHENTICATED' });
  const rotated = await service.refresh({ refreshToken: session.refreshToken, deviceId });
  await pool.query("UPDATE holdlog.auth_sessions SET idle_expires_at=statement_timestamp()-interval '1 microsecond' WHERE account_id=$1", [session.profile.id]);
  await assert.rejects(service.refresh({ refreshToken: rotated.refreshToken, deviceId }), { code: 'UNAUTHENTICATED' });
  await assert.rejects(service.getProfile(rotated.accessToken), { code: 'UNAUTHENTICATED' });
  await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [session.profile.id]);
  await assert.rejects(service.refresh({ refreshToken: rotated.refreshToken, deviceId }), { code: 'UNAUTHENTICATED' });
}));

void test('concurrent refresh consumes once and commits replay revocation before either new access is reused', () => fixture(async (pool, service, session, _subject, deviceId) => {
  const results = await Promise.allSettled([service.refresh({ refreshToken: session.refreshToken, deviceId }), service.refresh({ refreshToken: session.refreshToken, deviceId })]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const success = results.find(result => result.status === 'fulfilled'); if (success?.status !== 'fulfilled') throw new Error('Expected one rotation');
  await assert.rejects(service.getProfile(success.value.accessToken), { code: 'UNAUTHENTICATED' });
  assert.equal((await pool.query<{ revoked: boolean }>('SELECT revoked_at IS NOT NULL AS revoked FROM holdlog.auth_sessions WHERE account_id=$1', [session.profile.id])).rows[0]?.revoked, true);
}));

void test('new different-account installation login clears old push secrets and old logout cannot detach it', () => fixture(async (pool, firstService, first, subject, deviceId) => {
  await pool.query('UPDATE holdlog.device_installations SET push_token_ciphertext=$2,push_token_hash=$3 WHERE id=$1', [deviceId, 'synthetic-ciphertext', hashSecret('synthetic-push')]);
  const secondSubject = randomUUID(), secondService = new IdentityService(pool, { verify: input => Promise.resolve({ provider: input.provider, subject: secondSubject, email: null }) });
  const challenge = await secondService.challenge(), login = await secondService.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
  if (login.kind !== 'signup_required') throw new Error('Expected proof');
  let second: MobileSession | undefined;
  try {
    second = await secondService.signup({ signupToken: login.signup.signupToken, deviceId, name: 'second' }, randomUUID());
    await assert.rejects(firstService.logout(first.accessToken), { code: 'UNAUTHENTICATED' });
    const device = (await pool.query<{ account_id: string; push_token_hash: null; push_token_ciphertext: null }>('SELECT account_id,push_token_hash,push_token_ciphertext FROM holdlog.device_installations WHERE id=$1', [deviceId])).rows[0];
    assert.deepEqual(device, { account_id: second.profile.id, push_token_hash: null, push_token_ciphertext: null });
    assert.equal((await secondService.getProfile(second.accessToken)).id, second.profile.id);
  } finally {
    await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [second?.profile.id]);
    await pool.query('DELETE FROM holdlog.request_receipts WHERE principal_id IN (SELECT id FROM holdlog.signup_proofs WHERE provider_subject=$1)', [secondSubject]);
    await pool.query('DELETE FROM holdlog.signup_proofs WHERE provider_subject=$1', [secondSubject]);
  }
  assert.ok(subject);
}));

void test('installation reconnect waits for an authorized profile write and cannot invalidate it before commit', () => fixture(async (pool, service, session, _subject, deviceId) => {
  const key = randomUUID(), blocker = await pool.connect(), otherSubject = randomUUID();
  const other = new IdentityService(pool, { verify: input => Promise.resolve({ provider: input.provider, subject: otherSubject, email: null }) });
  const challenge = await other.challenge(), login = await other.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
  if (login.kind !== 'signup_required') throw new Error('Expected proof');
  let editing: Promise<unknown> | undefined, reconnecting: Promise<MobileSession> | undefined;
  try {
    await blocker.query('BEGIN'); await blocker.query('SELECT pg_advisory_xact_lock(510013)');
    await pool.query(`CREATE FUNCTION holdlog.test_profile_pause() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.key='${key}'::uuid THEN PERFORM pg_advisory_xact_lock(510013); END IF; RETURN NEW; END $$;
      CREATE TRIGGER test_profile_pause BEFORE INSERT ON holdlog.request_receipts FOR EACH ROW EXECUTE FUNCTION holdlog.test_profile_pause()`);
    editing = service.editProfile(session.accessToken, { name: 'before reconnect' }, 1, key);
    let deadline = Date.now() + 2000;
    while (!(await pool.query("SELECT 1 FROM pg_locks WHERE locktype='advisory' AND objid=510013 AND NOT granted")).rowCount && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
    reconnecting = other.signup({ signupToken: login.signup.signupToken, deviceId, name: 'other' }, randomUUID());
    // The reconnect must block on the device held by the authorized write, not commit ahead of it.
    deadline = Date.now() + 2000; let waiting = false;
    while (Date.now() < deadline) {
      waiting = !!(await pool.query("SELECT 1 FROM pg_locks WHERE locktype='advisory' AND objid<>510013 AND NOT granted")).rowCount;
      if (waiting) break; await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(waiting, true);
    await blocker.query('COMMIT'); await editing; await reconnecting;
    await assert.rejects(service.getProfile(session.accessToken), { code: 'UNAUTHENTICATED' });
  } finally {
    await blocker.query('ROLLBACK'); blocker.release();
    await Promise.allSettled([editing, reconnecting].filter(value => value !== undefined));
    await pool.query('DROP TRIGGER IF EXISTS test_profile_pause ON holdlog.request_receipts; DROP FUNCTION IF EXISTS holdlog.test_profile_pause()');
    await pool.query('DELETE FROM holdlog.request_receipts WHERE principal_id IN (SELECT id FROM holdlog.signup_proofs WHERE provider_subject=$1)', [otherSubject]);
    await pool.query('DELETE FROM holdlog.accounts WHERE id IN (SELECT account_id FROM holdlog.external_identities WHERE provider_subject=$1)', [otherSubject]);
    await pool.query('DELETE FROM holdlog.signup_proofs WHERE provider_subject=$1', [otherSubject]);
  }
}));

void test('refresh storage failure rolls back credential consumption; logout failure rolls back revocation and device detach', () => fixture(async (pool, service, session, _subject, deviceId) => {
  await pool.query(`CREATE FUNCTION holdlog.test_refresh_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$;
    CREATE TRIGGER test_refresh_failure BEFORE INSERT ON holdlog.refresh_credentials FOR EACH ROW EXECUTE FUNCTION holdlog.test_refresh_failure()`);
  try { await assert.rejects(service.refresh({ refreshToken: session.refreshToken, deviceId })); }
  finally { await pool.query('DROP TRIGGER test_refresh_failure ON holdlog.refresh_credentials; DROP FUNCTION holdlog.test_refresh_failure()'); }
  assert.equal((await service.getProfile(session.accessToken)).name, 'original');
  const rotated = await service.refresh({ refreshToken: session.refreshToken, deviceId });
  await pool.query(`CREATE FUNCTION holdlog.test_logout_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.account_id IS NULL THEN RAISE EXCEPTION 'synthetic failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER test_logout_failure BEFORE UPDATE ON holdlog.device_installations FOR EACH ROW EXECUTE FUNCTION holdlog.test_logout_failure()`);
  try { await assert.rejects(service.logout(rotated.accessToken)); assert.equal((await service.getProfile(rotated.accessToken)).id, session.profile.id); }
  finally { await pool.query('DROP TRIGGER test_logout_failure ON holdlog.device_installations; DROP FUNCTION holdlog.test_logout_failure()'); }
  await service.logout(rotated.accessToken);
  // Dropping the first logout response does not make a retry resurrect the session or detach a different account.
  await assert.rejects(service.logout(rotated.accessToken), { code: 'UNAUTHENTICATED' });
  assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [session.profile.id])).rowCount, 1);
}));

void test('existing login challenge expires during installation wait without committing another session', () => fixture(async (pool, service, session, _subject, deviceId) => {
  const { lockDevice } = await import('../src/modules/identity/identity.repository.js');
  const blocker = await pool.connect(), challenge = await service.challenge(); let pending: Promise<unknown> | undefined;
  try {
    await blocker.query('BEGIN'); await lockDevice(blocker, deviceId);
    await pool.query("UPDATE holdlog.login_challenges SET created_at=statement_timestamp()-interval '5 minutes'+interval '500 milliseconds',expires_at=statement_timestamp()+interval '500 milliseconds' WHERE id=$1", [challenge.challengeId]);
    pending = service.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
    const denied = assert.rejects(pending, { code: 'UNAUTHENTICATED' });
    const deadline = Date.now() + 1000;
    while (!(await pool.query("SELECT 1 FROM pg_locks WHERE locktype='advisory' AND NOT granted")).rowCount && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
    await pool.query('SELECT pg_sleep(0.55)'); await blocker.query('COMMIT'); await denied;
    assert.equal((await pool.query('SELECT id FROM holdlog.auth_sessions WHERE account_id=$1', [session.profile.id])).rowCount, 1);
    assert.equal((await pool.query<{ consumed_at: null }>('SELECT consumed_at FROM holdlog.login_challenges WHERE id=$1', [challenge.challengeId])).rows[0]?.consumed_at, null);
  } finally { await blocker.query('ROLLBACK'); blocker.release(); await Promise.allSettled(pending ? [pending] : []); }
}));
