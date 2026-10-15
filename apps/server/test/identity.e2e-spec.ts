import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate } from '../src/database/migrate.js';
import { TIME_FORMAT } from '../src/database/time.js';
import { withTransaction } from '../src/database/transaction.js';
import { hashSecret, writeReceipt, readReceipt } from '../src/modules/identity/identity.repository.js';
import { holdDatabase, isoFromNow, sleepSync, testDatabase } from './helpers.js';

void test('one transaction commits account and receipt together and rolls them both back on failure', () => {
  const { db, close } = testDatabase();
  const accountId = randomUUID(), key = randomUUID();
  /** Count rows returned by a one-parameter query. */
  const rows = (sql: string, value: string) => db.prepare(sql).all(value).length;
  try {
    assert.throws(() => withTransaction(db, () => {
      db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(accountId, 'rollback fixture');
      writeReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('synthetic-input'), resultStatus: 201, resultResourceId: accountId });
      throw new Error('synthetic failure');
    }), /synthetic failure/);
    assert.equal(rows('SELECT id FROM accounts WHERE id=?', accountId), 0);
    assert.equal(rows('SELECT id FROM request_receipts WHERE "key"=?', key), 0);
    withTransaction(db, () => {
      db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(accountId, 'commit fixture');
      writeReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('synthetic-input'), resultStatus: 201, resultResourceId: accountId });
      const receipt = readReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key });
      assert.equal(receipt?.result_resource_id, accountId);
      assert.equal(readReceipt(db, { principalScope: 'signup', principalId: accountId, operation: 'synthetic', key }), undefined);
    });
    assert.equal(rows('SELECT id FROM accounts WHERE id=?', accountId), 1);
    assert.throws(() => withTransaction(db, () => writeReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('different-input'), resultStatus: 201 })), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
    db.prepare('UPDATE request_receipts SET created_at=?, expires_at=? WHERE "key"=?').run(isoFromNow(-2 * 86_400_000), isoFromNow(-86_400_000), key);
    withTransaction(db, () => {
      assert.equal(readReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key }), undefined);
      writeReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('new-after-retention'), resultStatus: 200 });
      assert.equal(readReceipt(db, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key })?.result_status, 200);
    });
  } finally { close(); }
});

void test('a receipt expiring between statements of one transaction is absent and replaceable using the current statement time', () => {
  const { db, close } = testDatabase();
  const key = { principalScope: 'signup' as const, principalId: randomUUID(), operation: 'expiry-fixture', key: randomUUID() };
  try {
    withTransaction(db, () => writeReceipt(db, { ...key, requestHash: hashSecret('first-input'), resultStatus: 409 }));
    withTransaction(db, () => {
      // Expire 50 ms after this statement, then let time pass before the next statements of the same transaction.
      db.prepare(`UPDATE request_receipts SET created_at=?, expires_at=strftime('${TIME_FORMAT}', 'now', '+0.050 seconds') WHERE "key"=?`).run(isoFromNow(-86_400_000), key.key);
      assert.ok(readReceipt(db, key));
      sleepSync(80);
      assert.equal(readReceipt(db, key), undefined);
      writeReceipt(db, { ...key, requestHash: hashSecret('new-input'), resultStatus: 201 });
      assert.equal(readReceipt(db, key)?.request_hash, hashSecret('new-input'));
    });
  } finally { close(); }
});

void test('a competing identity committed by another process makes the waiting transaction fail with no orphan account', async () => {
  const { config, db, close } = testDatabase();
  const subject = randomUUID(), firstId = randomUUID(), secondId = randomUUID();
  try {
    const holder = await holdDatabase(config.databasePath, 300, `INSERT INTO accounts (id, display_name) VALUES ('${firstId}', 'first fixture');
      INSERT INTO external_identities (id, account_id, provider, provider_subject) VALUES ('${randomUUID()}', '${firstId}', 'google', '${subject}');`);
    const started = Date.now();
    // BEGIN IMMEDIATE waits for the other process to commit; the unique index then rejects the same identity.
    assert.throws(() => withTransaction(db, () => {
      db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(secondId, 'losing fixture');
      db.prepare('INSERT INTO external_identities (id, account_id, provider, provider_subject) VALUES (?, ?, ?, ?)').run(randomUUID(), secondId, 'google', subject);
    }), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
    assert.ok(Date.now() - started >= 250, 'the second writer must wait for the held write lock');
    assert.deepEqual(await holder.exited, [0, null]);
    assert.equal(db.prepare('SELECT id FROM accounts WHERE id=?').all(secondId).length, 0);
    assert.equal(db.prepare('SELECT id FROM external_identities WHERE provider_subject=?').all(subject).length, 1);
  } finally { close(); }
});

void test('DB constraints separate provider identities, preserve nullable installation stubs and reject invalid ownership/version', () => {
  const { db, close } = testDatabase();
  const accountId = randomUUID(), secondId = randomUUID(), deviceId = randomUUID(), subject = randomUUID();
  try {
    for (const name of ['', ' \t\n']) assert.throws(() => db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(randomUUID(), name), { code: 'SQLITE_CONSTRAINT_CHECK' });
    assert.throws(() => db.prepare('INSERT INTO accounts (id, display_name, version) VALUES (?, ?, 0)').run(randomUUID(), 'version fixture'), { code: 'SQLITE_CONSTRAINT_CHECK' });
    db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?), (?, ?)').run(accountId, 'same name fixture', secondId, 'same name fixture');
    // Email is shared deliberately; provider+subject alone defines identity uniqueness.
    db.prepare('INSERT INTO external_identities (id, account_id, provider, provider_subject, email) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)')
      .run(randomUUID(), accountId, 'google', subject, 'synthetic@example.invalid', randomUUID(), secondId, 'apple', subject, 'synthetic@example.invalid');
    assert.throws(() => db.prepare('INSERT INTO external_identities (id, account_id, provider, provider_subject) VALUES (?, ?, ?, ?)').run(randomUUID(), secondId, 'google', subject), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
    assert.throws(() => db.prepare('INSERT INTO external_identities (id, account_id, provider, provider_subject) VALUES (?, ?, ?, ?)').run(randomUUID(), randomUUID(), 'google', randomUUID()), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
    db.prepare('INSERT INTO device_installations (id, account_id) VALUES (?, ?)').run(deviceId, accountId);
    const device = db.prepare('SELECT platform, push_permission, app_version, push_token_hash, push_token_ciphertext FROM device_installations WHERE id=?').get(deviceId);
    assert.deepEqual(device, { platform: null, push_permission: null, app_version: null, push_token_hash: null, push_token_ciphertext: null });
    assert.throws(() => db.prepare('UPDATE device_installations SET push_token_hash=? WHERE id=?').run(hashSecret('synthetic-push'), deviceId), { code: 'SQLITE_CONSTRAINT_CHECK' });
    assert.throws(() => db.prepare('UPDATE device_installations SET version=0 WHERE id=?').run(deviceId), { code: 'SQLITE_CONSTRAINT_CHECK' });
  } finally { close(); }
});

void test('refresh credentials and current-refresh pointers cannot cross session families; account removal cascades secrets', () => {
  const { db, close } = testDatabase();
  const accountId = randomUUID(), sessionId = randomUUID(), otherSessionId = randomUUID(), family = randomUUID(), otherFamily = randomUUID(), refreshId = randomUUID();
  const access = isoFromNow(900_000), idle = isoFromNow(30 * 86_400_000), absolute = isoFromNow(90 * 86_400_000);
  try {
    db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(accountId, 'session fixture');
    db.prepare('INSERT INTO auth_sessions (id, account_id, token_family_id, expires_at, idle_expires_at, absolute_expires_at) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)')
      .run(sessionId, accountId, family, access, idle, absolute, otherSessionId, accountId, otherFamily, access, idle, absolute);
    assert.throws(() => db.prepare('INSERT INTO refresh_credentials (id, session_id, token_family_id, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)').run(randomUUID(), sessionId, otherFamily, hashSecret('wrong-family'), absolute), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
    db.prepare('INSERT INTO refresh_credentials (id, session_id, token_family_id, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)').run(refreshId, sessionId, family, hashSecret('synthetic-refresh'), absolute);
    // The deferred pointer check lets the statement pass and fails at COMMIT (787), rolling the transaction back.
    let statementPassed = false;
    assert.throws(() => withTransaction(db, () => { db.prepare('UPDATE auth_sessions SET current_refresh_credential_id=? WHERE id=?').run(refreshId, otherSessionId); statementPassed = true; }), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
    assert.equal(statementPassed, true);
    db.prepare('UPDATE auth_sessions SET current_refresh_credential_id=? WHERE id=?').run(refreshId, sessionId);
    db.prepare('INSERT INTO access_credentials (id, session_id, token_hash, expires_at) VALUES (?, ?, ?, ?)').run(randomUUID(), sessionId, hashSecret('synthetic-access'), access);
    assert.throws(() => db.prepare('INSERT INTO access_credentials (id, session_id, token_hash, expires_at) VALUES (?, ?, ?, ?)').run(randomUUID(), sessionId, 'raw-synthetic-access', access), { code: 'SQLITE_CONSTRAINT_CHECK' });
    db.prepare('DELETE FROM accounts WHERE id=?').run(accountId);
    assert.equal(db.prepare('SELECT id FROM refresh_credentials WHERE id=?').all(refreshId).length, 0);
    assert.equal(db.prepare('SELECT id FROM access_credentials WHERE session_id=?').all(sessionId).length, 0);
  } finally { close(); }
});

void test('a failed follow-up migration rolls back DDL and history while preserving the applied identity schema', () => {
  const { db, close } = testDatabase();
  const directory = mkdtempSync(join(tmpdir(), 'holdlog-identity-migration-'));
  try {
    const source = new URL('../../db/migrations/', import.meta.url);
    for (const name of readdirSync(source)) if (/^\d+_[a-z0-9_]+\.sql$/.test(name)) writeFileSync(join(directory, name), readFileSync(new URL(name, source), 'utf8'));
    // 999 keeps clear of the next real migration number.
    writeFileSync(join(directory, '999_failure.sql'), 'CREATE TABLE synthetic_failed_migration (id TEXT) STRICT; SELECT * FROM synthetic_missing_table;');
    assert.throws(() => migrate(db, directory));
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='synthetic_failed_migration'").all().length, 0);
    assert.equal(db.prepare('SELECT version FROM schema_migrations WHERE version=?').all('999_failure.sql').length, 0);
    migrate(db);
  } finally { close(); rmSync(directory, { recursive: true, force: true }); }
});

void test('identity migration creates the storage boundary and is repeatable without replacing existing accounts', () => {
  const { db, close } = testDatabase();
  const id = randomUUID();
  try {
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'").all().length, 1);
    db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(id, '합성 회원');
    migrate(db);
    assert.equal(db.prepare('SELECT id FROM accounts WHERE id=?').all(id).length, 1);
    const columns = db.prepare<[], { column_name: string }>("SELECT p.name AS column_name FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type='table'").all();
    assert.ok(columns.length > 0);
    assert.ok(columns.every(row => !['token', 'password', 'response_body', 'id_token', 'signup_token', 'authorization_code'].includes(row.column_name)));
  } finally { close(); }
});
