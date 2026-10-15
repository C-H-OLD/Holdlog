import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import type Database from 'better-sqlite3';
import { now, TIME_FORMAT } from '../src/database/time.js';
import { withTransaction } from '../src/database/transaction.js';
import { enqueue } from '../src/jobs/queue.js';
import { registerApplicationWorkers } from '../src/jobs/register.js';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { hashSecret, writeReceipt } from '../src/modules/identity/identity.repository.js';
import { cleanupSignupProofs, startSignupProofCleanup } from '../src/modules/identity/signup-proof-cleanup.js';
import { SignupRequestLocks, signupRequestKey } from '../src/modules/identity/signup-request-locks.js';
import { holdDatabase, registerTestFunctions, testDatabase, waitFor } from './helpers.js';

/** Insert an ephemeral proof without provider calls, for deterministic signup concurrency/rollback cases. */
function proof(db: Database.Database, subject: string, deviceId: string) {
  const token = randomUUID(), id = randomUUID();
  db.prepare(`INSERT INTO signup_proofs (id, token_hash, provider, provider_subject, device_id, expires_at) VALUES (?, ?, 'google', ?, ?, ${now('+15 minutes')})`).run(id, hashSecret(token), subject, deviceId);
  return { id, signupToken: token, deviceId, name: '가입 회원' };
}

/** Count rows returned by a one-parameter query. */
function count(db: Database.Database, sql: string, value: string): number { return db.prepare(sql).all(value).length; }

/** A verifier for tests that only complete existing proofs. */
const unused = { verify: () => Promise.reject(new Error('unused')) };

void test('signup entry contention returns409 while the key is held; a committed proof never replays tokens', async () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID(), key = randomUUID(), locks = new SignupRequestLocks();
  const service = new IdentityService(db, unused, locks);
  const { id, ...input } = proof(db, subject, deviceId);
  try {
    // Hold the entry a first request would hold until its commit; the transaction is synchronous, so a test holds it instead.
    const entry = signupRequestKey(id, key);
    assert.equal(locks.tryAcquire(entry), true);
    await assert.rejects(service.signup(input, key.toUpperCase()), { code: 'REQUEST_IN_PROGRESS' });
    await assert.rejects(service.signup({ ...input, name: 'other input' }, key), { code: 'REQUEST_IN_PROGRESS' });
    assert.equal(count(db, 'SELECT id FROM external_identities WHERE provider_subject=?', subject), 0);
    locks.release(entry);
    const session = await service.signup(input, key);
    await assert.rejects(service.signup(input, key), { code: 'UNAUTHENTICATED' });
    assert.equal(count(db, 'SELECT id FROM accounts WHERE id=?', session.profile.id), 1);
    assert.equal(count(db, 'SELECT id FROM auth_sessions WHERE account_id=?', session.profile.id), 1);
    const receipt = db.prepare('SELECT * FROM request_receipts WHERE "key"=?').get(key);
    assert.ok(!JSON.stringify(receipt).includes(session.accessToken)); assert.ok(!JSON.stringify(receipt).includes(input.signupToken));
  } finally { close(); }
});

void test('upper-case and urn:uuid: spellings of the installation and request key reach the same proof and receipt', async () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID(), key = randomUUID(), service = new IdentityService(db, unused);
  const { id, ...input } = proof(db, subject, deviceId);
  try {
    const session = await service.signup({ ...input, deviceId: 'urn:uuid:' + deviceId.toUpperCase() }, 'URN:UUID:' + key.toUpperCase());
    assert.equal(db.prepare<[string], { device_id: string }>('SELECT device_id FROM auth_sessions WHERE account_id=?').get(session.profile.id)?.device_id, deviceId);
    assert.equal(count(db, 'SELECT id FROM request_receipts WHERE "key"=?', key), 1);
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=? AND consumed_at IS NOT NULL', id), 1);
  } finally { close(); }
});

void test('two valid proofs for one identity create exactly one account; the loser commits proof consumption and409 receipt', async () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID(), service = new IdentityService(db, unused);
  try {
    const { id: firstId, ...first } = proof(db, subject, deviceId), { id: secondId, ...second } = proof(db, subject, deviceId);
    const results = await Promise.allSettled([service.signup(first, randomUUID()), service.signup(second, randomUUID())]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const denied = results.find(result => result.status === 'rejected'); assert.equal(denied?.status === 'rejected' && (denied.reason as { code: string }).code, 'SIGNUP_ALREADY_COMPLETED');
    assert.equal(count(db, 'SELECT id FROM external_identities WHERE provider_subject=?', subject), 1);
    assert.equal(db.prepare('SELECT id FROM signup_proofs WHERE id IN (?, ?) AND consumed_at IS NOT NULL').all(firstId, secondId).length, 2);
    assert.equal(db.prepare("SELECT id FROM request_receipts WHERE principal_id IN (?, ?) AND error_code='SIGNUP_ALREADY_COMPLETED'").all(firstId, secondId).length, 1);
  } finally { close(); }
});

void test('receipt SQL failure rolls back every signup effect and permits retry with the same proof/key', async () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID(), key = randomUUID(), service = new IdentityService(db, unused);
  const { id, ...input } = proof(db, subject, deviceId);
  try {
    db.exec(`CREATE TEMP TRIGGER test_receipt_failure BEFORE INSERT ON main.request_receipts WHEN NEW."key" = '${key}' BEGIN SELECT RAISE(ABORT, 'synthetic receipt failure'); END`);
    await assert.rejects(service.signup(input, key));
    assert.equal(count(db, 'SELECT id FROM external_identities WHERE provider_subject=?', subject), 0);
    assert.equal(count(db, 'SELECT id FROM device_installations WHERE id=?', deviceId), 0);
    assert.equal(db.prepare<[string], { consumed_at: string | null }>('SELECT consumed_at FROM signup_proofs WHERE id=?').get(id)?.consumed_at, null);
    db.exec('DROP TRIGGER test_receipt_failure');
    const result = await service.signup(input, key); assert.equal(result.profile.name, input.name);
  } finally { close(); }
});

void test('proof cleanup removes consumed/expired identity data, preserves valid proofs and receipts and repeats safely', () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID(), receiptKey = randomUUID();
  try {
    const live = proof(db, subject, deviceId), expired = proof(db, subject, deviceId), consumed = proof(db, subject, deviceId);
    db.prepare(`UPDATE signup_proofs SET created_at=strftime('${TIME_FORMAT}', 'now', '-1 days'), expires_at=strftime('${TIME_FORMAT}', 'now', '-1 seconds') WHERE id=?`).run(expired.id);
    db.prepare(`UPDATE signup_proofs SET consumed_at=${now()} WHERE id=?`).run(consumed.id);
    withTransaction(db, () => writeReceipt(db, { principalScope: 'signup', principalId: consumed.id, operation: 'completeSignup', key: receiptKey, requestHash: hashSecret('synthetic-request'), resultStatus: 409, errorCode: 'SIGNUP_ALREADY_COMPLETED' }));
    assert.equal(cleanupSignupProofs(db), 2);
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', live.id), 1);
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', expired.id), 0);
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', consumed.id), 0);
    assert.equal(cleanupSignupProofs(db), 0);
    assert.equal(count(db, 'SELECT id FROM request_receipts WHERE "key"=?', receiptKey), 1);
  } finally { close(); }
});

void test('the proof cleanup timer runs once at start and then on its interval, preserving active proofs', async () => {
  const { db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID();
  const stale = proof(db, subject, deviceId), live = proof(db, subject, deviceId);
  db.prepare(`UPDATE signup_proofs SET consumed_at=${now()} WHERE id=?`).run(stale.id);
  const stop = startSignupProofCleanup(db, 50);
  try {
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', stale.id), 0);
    const later = proof(db, subject, deviceId);
    db.prepare(`UPDATE signup_proofs SET consumed_at=${now()} WHERE id=?`).run(later.id);
    assert.ok(await waitFor(() => count(db, 'SELECT id FROM signup_proofs WHERE id=?', later.id) === 0, 2000));
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', live.id), 1);
  } finally { stop(); close(); }
});

void test('proof and challenge expiry committed while another process holds the write lock is seen after the wait', async () => {
  const { config, db, close } = testDatabase();
  const subject = randomUUID(), deviceId = randomUUID();
  const service = new IdentityService(db, { verify: input => Promise.resolve({ provider: input.provider, subject, email: null }) });
  const { id, ...input } = proof(db, subject, deviceId);
  /** Build the holder's SQL that expires one proof/challenge row just before the waiting transaction reads it. */
  const expire = (table: string, rowId: string) => `UPDATE ${table} SET created_at=strftime('${TIME_FORMAT}', 'now', '-1 days'), expires_at=strftime('${TIME_FORMAT}', 'now', '-0.001 seconds') WHERE id='${rowId}'`;
  try {
    let holder = await holdDatabase(config.databasePath, 200, expire('signup_proofs', id));
    await assert.rejects(service.signup(input, randomUUID()), { code: 'UNAUTHENTICATED' });
    assert.deepEqual(await holder.exited, [0, null]);
    const challenge = await service.challenge();
    holder = await holdDatabase(config.databasePath, 200, expire('login_challenges', challenge.challengeId));
    // The pre-transaction read still sees the challenge; the transaction reads again after the holder commits.
    await assert.rejects(service.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null }), { code: 'UNAUTHENTICATED' });
    assert.deepEqual(await holder.exited, [0, null]);
    assert.equal(count(db, 'SELECT id FROM external_identities WHERE provider_subject=?', subject), 0);
  } finally { close(); }
});

void test('unique collision rolls back the first account and rechecks proof/identity on a fresh transaction', async () => {
  const { db, close } = testDatabase();
  registerTestFunctions(db);
  const subject = randomUUID(), deviceId = randomUUID(), racer = randomUUID(), service = new IdentityService(db, unused);
  const { id, ...input } = proof(db, subject, deviceId);
  try {
    // A racing account takes the same identity just before the first insert (a real 2067); test_once makes it fire once.
    db.exec(`CREATE TEMP TRIGGER test_unique_race BEFORE INSERT ON main.external_identities
      WHEN NEW.provider_subject = '${subject}' AND test_once('unique-race') = 1
      BEGIN
        INSERT INTO accounts (id, display_name) VALUES ('${racer}', 'racing fixture');
        INSERT INTO external_identities (id, account_id, provider, provider_subject) VALUES ('${randomUUID()}', '${racer}', NEW.provider, NEW.provider_subject);
      END`);
    const result = await service.signup(input, randomUUID());
    assert.equal(count(db, 'SELECT id FROM external_identities WHERE provider_subject=?', subject), 1);
    assert.equal(count(db, 'SELECT id FROM accounts WHERE id=?', racer), 0);
    assert.equal(count(db, 'SELECT id FROM auth_sessions WHERE account_id=?', result.profile.id), 1);
    assert.equal(db.prepare<[string], { consumed: number }>('SELECT consumed_at IS NOT NULL AS consumed FROM signup_proofs WHERE id=?').get(id)?.consumed, 1);
  } finally { close(); }
});

void test('signup proof expires during the installation write and rolls back the provisional account/session', async () => {
  const { db, close } = testDatabase();
  registerTestFunctions(db);
  const subject = randomUUID(), deviceId = randomUUID(), service = new IdentityService(db, unused);
  const { id, ...input } = proof(db, subject, deviceId);
  try {
    db.prepare(`UPDATE signup_proofs SET expires_at=strftime('${TIME_FORMAT}', 'now', '+0.300 seconds') WHERE id=?`).run(id);
    db.exec('CREATE TEMP TRIGGER test_install_wait BEFORE INSERT ON main.device_installations BEGIN SELECT test_sleep(500); END');
    await assert.rejects(service.signup(input, randomUUID()), { code: 'UNAUTHENTICATED' });
    assert.equal(count(db, 'SELECT id FROM external_identities WHERE provider_subject=?', subject), 0);
    assert.equal(count(db, 'SELECT id FROM auth_sessions WHERE device_id=?', deviceId), 0);
  } finally { close(); }
});

void test('a failed cleanup tick logs only its category and the next tick removes the proof', async () => {
  const { db, close } = testDatabase();
  registerTestFunctions(db);
  const subject = randomUUID(), deviceId = randomUUID(), stale = proof(db, subject, deviceId);
  db.prepare(`UPDATE signup_proofs SET consumed_at=${now()} WHERE id=?`).run(stale.id);
  db.exec(`CREATE TEMP TRIGGER test_cleanup_failure BEFORE DELETE ON main.signup_proofs WHEN OLD.provider_subject = '${subject}' AND test_once('cleanup') = 1 BEGIN SELECT RAISE(ABORT, '${subject}'); END`);
  const lines: string[] = [], original = console.info;
  console.info = (line: string) => { lines.push(line); };
  let stop: (() => void) | undefined;
  try {
    stop = startSignupProofCleanup(db, 50);
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', stale.id), 1);
    assert.ok(await waitFor(() => count(db, 'SELECT id FROM signup_proofs WHERE id=?', stale.id) === 0, 2000));
    assert.ok(lines.includes('{"event":"worker.failed"}'));
    assert.ok(lines.every(line => !line.includes(subject)));
  } finally { stop?.(); console.info = original; close(); }
});

void test('production worker registration runs proof cleanup without the development synthetic queue', async () => {
  const { config, db, close } = testDatabase();
  const production = { ...config, environment: 'production' as const };
  const stale = proof(db, randomUUID(), randomUUID());
  db.prepare(`UPDATE signup_proofs SET consumed_at=${now()} WHERE id=?`).run(stale.id);
  const workers = registerApplicationWorkers(db, production, { pollMs: 10, cleanupMs: 60_000, foundation: { baseDelayMs: 10, maxAttempts: 2, leaseMs: 1000 } });
  try {
    assert.equal(count(db, 'SELECT id FROM signup_proofs WHERE id=?', stale.id), 0);
    const jobKey = 'production-check-' + randomUUID();
    withTransaction(db, () => enqueue(db, { queue: production.queue, jobKey, maxAttempts: 2 }));
    await delay(150);
    assert.equal(db.prepare<[string], { state: string }>('SELECT state FROM jobs WHERE job_key=?').get(jobKey)?.state, 'queued');
  } finally { await workers.stop(100); close(); }
});
