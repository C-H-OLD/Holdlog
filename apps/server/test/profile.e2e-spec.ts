import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type Database from 'better-sqlite3';
import { TIME_FORMAT } from '../src/database/time.js';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { hashSecret } from '../src/modules/identity/identity.repository.js';
import type { MobileSession } from '../src/modules/identity/mobile-session.js';
import { isoFromNow, registerTestFunctions, testDatabase } from './helpers.js';

/** Create a synthetic subject and real session on a fresh DB; the DB folder is removed after each boundary test. */
async function fixture(work: (db: Database.Database, service: IdentityService, session: MobileSession, subject: string, deviceId: string) => Promise<void>): Promise<void> {
  const { db, close } = testDatabase();
  try {
    registerTestFunctions(db);
    const subject = randomUUID(), deviceId = randomUUID();
    const service = new IdentityService(db, { verify: input => Promise.resolve({ provider: input.provider, subject, email: 'same@example.invalid' }) });
    const challenge = await service.challenge();
    const login = await service.login({ provider: 'google', challengeId: challenge.challengeId, idToken: 'fixture', deviceId, authorizationCode: null });
    if (login.kind !== 'signup_required') throw new Error('Expected signup');
    const session = await service.signup({ signupToken: login.signup.signupToken, deviceId, name: 'original' }, randomUUID());
    await work(db, service, session, subject, deviceId);
  } finally { close(); }
}

void test('profile receipt failure preserves name/version; same key retries and stale/blank/photo patches preserve data', () => fixture(async (db, service, session) => {
  const key = randomUUID();
  await assert.rejects(service.editProfile(session.accessToken, {}, 1, key), { code: 'INVALID_INPUT' });
  db.exec(`CREATE TEMP TRIGGER test_profile_failure BEFORE INSERT ON main.request_receipts WHEN NEW."key" = '${key}' BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END`);
  try {
    await assert.rejects(service.editProfile(session.accessToken, { name: 'changed' }, 1, key));
    assert.deepEqual(await service.getProfile(session.accessToken), session.profile);
  } finally { db.exec('DROP TRIGGER test_profile_failure'); }
  const changed = await service.editProfile(session.accessToken, { name: 'changed' }, 1, key); assert.equal(changed.version, 2);
  await assert.rejects(service.editProfile(session.accessToken, { name: '  ' }, 2, randomUUID()), { code: 'INVALID_INPUT' });
  await assert.rejects(service.editProfile(session.accessToken, { photoFileId: randomUUID() }, 2, randomUUID()), { code: 'INVALID_INPUT' });
  await assert.rejects(service.editProfile(session.accessToken, { name: 'old version' }, 1, randomUUID()), { code: 'VERSION_CONFLICT' });
  assert.deepEqual(await service.getProfile(session.accessToken), changed);
}));

void test('same email and subject from another provider remains a distinct named account', () => fixture(async (db, service, first, subject, deviceId) => {
  const challenge = await service.challenge();
  const result = await service.login({ provider: 'apple', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
  assert.equal(result.kind, 'signup_required'); if (result.kind !== 'signup_required') throw new Error('Expected proof');
  const second = await service.signup({ signupToken: result.signup.signupToken, deviceId, name: 'second' }, randomUUID());
  assert.notEqual(second.profile.id, first.profile.id);
  assert.equal(db.prepare('SELECT account_id FROM external_identities WHERE provider_subject=?').all(subject).length, 2);
}));

void test('access and refresh expiry, installation mismatch and deleted account fail closed', () => fixture(async (db, service, session, _subject, deviceId) => {
  await assert.rejects(service.refresh({ refreshToken: session.refreshToken, deviceId: randomUUID() }), { code: 'UNAUTHENTICATED' });
  db.prepare('UPDATE access_credentials SET expires_at=? WHERE token_hash=?').run(isoFromNow(-1), hashSecret(session.accessToken));
  await assert.rejects(service.getProfile(session.accessToken), { code: 'UNAUTHENTICATED' });
  const rotated = await service.refresh({ refreshToken: session.refreshToken, deviceId });
  db.prepare('UPDATE auth_sessions SET idle_expires_at=? WHERE account_id=?').run(isoFromNow(-1), session.profile.id);
  await assert.rejects(service.refresh({ refreshToken: rotated.refreshToken, deviceId }), { code: 'UNAUTHENTICATED' });
  await assert.rejects(service.getProfile(rotated.accessToken), { code: 'UNAUTHENTICATED' });
  db.prepare('DELETE FROM accounts WHERE id=?').run(session.profile.id);
  await assert.rejects(service.refresh({ refreshToken: rotated.refreshToken, deviceId }), { code: 'UNAUTHENTICATED' });
}));

void test('concurrent refresh consumes once and commits replay revocation before either new access is reused', () => fixture(async (db, service, session, _subject, deviceId) => {
  const results = await Promise.allSettled([service.refresh({ refreshToken: session.refreshToken, deviceId }), service.refresh({ refreshToken: session.refreshToken, deviceId })]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const success = results.find(result => result.status === 'fulfilled'); if (success?.status !== 'fulfilled') throw new Error('Expected one rotation');
  await assert.rejects(service.getProfile(success.value.accessToken), { code: 'UNAUTHENTICATED' });
  assert.equal(db.prepare<[string], { revoked: number }>('SELECT revoked_at IS NOT NULL AS revoked FROM auth_sessions WHERE account_id=?').get(session.profile.id)?.revoked, 1);
}));

void test('new different-account installation login clears old push secrets and old logout cannot detach it', () => fixture(async (db, firstService, first, _subject, deviceId) => {
  db.prepare('UPDATE device_installations SET push_token_ciphertext=?, push_token_hash=? WHERE id=?').run('synthetic-ciphertext', hashSecret('synthetic-push'), deviceId);
  const secondSubject = randomUUID(), secondService = new IdentityService(db, { verify: input => Promise.resolve({ provider: input.provider, subject: secondSubject, email: null }) });
  const challenge = await secondService.challenge(), login = await secondService.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
  if (login.kind !== 'signup_required') throw new Error('Expected proof');
  const second = await secondService.signup({ signupToken: login.signup.signupToken, deviceId, name: 'second' }, randomUUID());
  await assert.rejects(firstService.logout(first.accessToken), { code: 'UNAUTHENTICATED' });
  const device = db.prepare('SELECT account_id, push_token_hash, push_token_ciphertext FROM device_installations WHERE id=?').get(deviceId);
  assert.deepEqual(device, { account_id: second.profile.id, push_token_hash: null, push_token_ciphertext: null });
  assert.equal((await secondService.getProfile(second.accessToken)).id, second.profile.id);
}));

void test('a committed profile write survives a later installation reconnect, which then ends the old session', () => fixture(async (db, service, session, _subject, deviceId) => {
  const otherSubject = randomUUID();
  const other = new IdentityService(db, { verify: input => Promise.resolve({ provider: input.provider, subject: otherSubject, email: null }) });
  const challenge = await other.challenge(), login = await other.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
  if (login.kind !== 'signup_required') throw new Error('Expected proof');
  // Writes are serialized by the single write lock, so the reconnect can only run before or after the edit, never inside it.
  const edited = await service.editProfile(session.accessToken, { name: 'before reconnect' }, 1, randomUUID());
  await other.signup({ signupToken: login.signup.signupToken, deviceId, name: 'other' }, randomUUID());
  assert.deepEqual(db.prepare('SELECT display_name, version FROM accounts WHERE id=?').get(session.profile.id), { display_name: 'before reconnect', version: edited.version });
  await assert.rejects(service.getProfile(session.accessToken), { code: 'UNAUTHENTICATED' });
}));

void test('refresh storage failure rolls back credential consumption; logout failure rolls back revocation and device detach', () => fixture(async (db, service, session, _subject, deviceId) => {
  db.exec("CREATE TEMP TRIGGER test_refresh_failure BEFORE INSERT ON main.refresh_credentials BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
  try { await assert.rejects(service.refresh({ refreshToken: session.refreshToken, deviceId })); }
  finally { db.exec('DROP TRIGGER test_refresh_failure'); }
  assert.equal((await service.getProfile(session.accessToken)).name, 'original');
  const rotated = await service.refresh({ refreshToken: session.refreshToken, deviceId });
  db.exec("CREATE TEMP TRIGGER test_logout_failure BEFORE UPDATE ON main.device_installations WHEN NEW.account_id IS NULL BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
  try { await assert.rejects(service.logout(rotated.accessToken)); assert.equal((await service.getProfile(rotated.accessToken)).id, session.profile.id); }
  finally { db.exec('DROP TRIGGER test_logout_failure'); }
  await service.logout(rotated.accessToken);
  // Dropping the first logout response does not make a retry resurrect the session or detach a different account.
  await assert.rejects(service.logout(rotated.accessToken), { code: 'UNAUTHENTICATED' });
  assert.equal(db.prepare('SELECT id FROM accounts WHERE id=?').all(session.profile.id).length, 1);
}));

void test('existing login challenge expires during the installation write without committing another session', () => fixture(async (db, service, session, _subject, deviceId) => {
  const challenge = await service.challenge();
  // Expire the challenge 300 ms from now and make the installation write inside the login transaction take 500 ms.
  db.prepare(`UPDATE login_challenges SET expires_at=strftime('${TIME_FORMAT}', 'now', '+0.300 seconds') WHERE id=?`).run(challenge.challengeId);
  db.exec('CREATE TEMP TRIGGER test_install_wait BEFORE INSERT ON main.device_installations BEGIN SELECT test_sleep(500); END');
  try {
    await assert.rejects(service.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null }), { code: 'UNAUTHENTICATED' });
  } finally { db.exec('DROP TRIGGER test_install_wait'); }
  assert.equal(db.prepare('SELECT id FROM auth_sessions WHERE account_id=?').all(session.profile.id).length, 1);
  assert.equal(db.prepare<[string], { consumed_at: string | null }>('SELECT consumed_at FROM login_challenges WHERE id=?').get(challenge.challengeId)?.consumed_at, null);
}));
