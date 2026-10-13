import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { integrationConfiguration } from './helpers.js';
import { withTransaction } from '../src/database/transaction.js';
import { hashSecret, lockIdentityState, trySignupRequestLock, writeReceipt, readReceipt } from '../src/modules/identity/identity.repository.js';

void test('one transaction client commits account and receipt together and rolls them both back on failure', async () => {
  const pool = createDatabase(integrationConfiguration());
  const accountId = randomUUID(), key = randomUUID();
  try {
    await migrate(pool);
    await assert.rejects(withTransaction(pool, async client => {
      await client.query('INSERT INTO holdlog.accounts(id, display_name) VALUES ($1,$2)', [accountId, 'rollback fixture']);
      await writeReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('synthetic-input'), resultStatus: 201, resultResourceId: accountId });
      throw new Error('synthetic failure');
    }), /synthetic failure/);
    assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [accountId])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.request_receipts WHERE key=$1', [key])).rowCount, 0);
    await withTransaction(pool, async client => {
      await client.query('INSERT INTO holdlog.accounts(id, display_name) VALUES ($1,$2)', [accountId, 'commit fixture']);
      await writeReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('synthetic-input'), resultStatus: 201, resultResourceId: accountId });
      const receipt = await readReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key });
      assert.equal(receipt?.result_resource_id, accountId);
      assert.equal(await readReceipt(client, { principalScope: 'signup', principalId: accountId, operation: 'synthetic', key }), undefined);
    });
    assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [accountId])).rowCount, 1);
    await assert.rejects(withTransaction(pool, client => writeReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('different-input'), resultStatus: 201 })), { code: '23505' });
    await pool.query("UPDATE holdlog.request_receipts SET created_at=now()-interval '2 days',expires_at=now()-interval '1 day' WHERE key=$1", [key]);
    await withTransaction(pool, async client => {
      assert.equal(await readReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key }), undefined);
      await writeReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key, requestHash: hashSecret('new-after-retention'), resultStatus: 200 });
      assert.equal((await readReceipt(client, { principalScope: 'mobile', principalId: accountId, operation: 'synthetic', key }))?.result_status, 200);
    });
  } finally {
    await pool.query('DELETE FROM holdlog.request_receipts WHERE key=$1', [key]);
    await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [accountId]);
    await pool.end();
  }
});

void test('signup request lock is nonblocking across clients and is released by rollback', async () => {
  const pool = createDatabase(integrationConfiguration());
  const first = await pool.connect(), second = await pool.connect();
  const proofId = randomUUID(), key = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  try {
    await first.query('BEGIN'); await second.query('BEGIN');
    assert.equal(await trySignupRequestLock(first, proofId, key), true);
    assert.equal(await trySignupRequestLock(second, proofId, key), false);
    assert.equal(await trySignupRequestLock(second, proofId.toUpperCase(), key.toUpperCase()), false);
    assert.equal(await trySignupRequestLock(second, proofId, randomUUID()), true);
    await first.query('ROLLBACK');
    assert.equal(await trySignupRequestLock(second, proofId, key), true);
  } finally {
    await first.query('ROLLBACK'); await second.query('ROLLBACK');
    first.release(); second.release(); await pool.end();
  }
});

void test('receipt expiring after BEGIN is absent and replaceable using the current statement time', async () => {
  const pool = createDatabase(integrationConfiguration());
  const key = { principalScope: 'signup' as const, principalId: randomUUID(), operation: 'expiry-fixture', key: randomUUID() };
  try {
    await migrate(pool);
    await withTransaction(pool, client => writeReceipt(client, { ...key, requestHash: hashSecret('first-input'), resultStatus: 409 }));
    await withTransaction(pool, async client => {
      // No timing sleeps: position expiry just after this TX's start, before subsequent statements.
      await client.query("UPDATE holdlog.request_receipts SET created_at=now()-interval '1 day', expires_at=now()+interval '1 microsecond' WHERE key=$1", [key.key]);
      const boundary = await client.query<{ expired: boolean; after_start: boolean }>('SELECT expires_at < statement_timestamp() AS expired, expires_at > transaction_timestamp() AS after_start FROM holdlog.request_receipts WHERE key=$1', [key.key]);
      assert.deepEqual(boundary.rows[0], { expired: true, after_start: true });
      assert.equal(await readReceipt(client, key), undefined);
      await writeReceipt(client, { ...key, requestHash: hashSecret('new-input'), resultStatus: 201 });
      assert.equal((await readReceipt(client, key))?.request_hash, hashSecret('new-input'));
    });
  } finally { await pool.query('DELETE FROM holdlog.request_receipts WHERE key=$1', [key.key]); await pool.end(); }
});

void test('same identity locking serializes competing account inserts and the losing transaction leaves no orphan', async () => {
  const pool = createDatabase(integrationConfiguration());
  const subject = randomUUID(), firstId = randomUUID(), secondId = randomUUID();
  const first = await pool.connect();
  try {
    await migrate(pool); await first.query('BEGIN');
    await lockIdentityState(first, { identity: { provider: 'google', subject }, accountIds: [firstId] });
    await first.query('INSERT INTO holdlog.accounts(id,display_name) VALUES ($1,$2)', [firstId, 'first fixture']);
    await first.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject) VALUES ($1,$2,$3)', [firstId, 'google', subject]);
    let publishPid!: (value: number) => void;
    const pidReady = new Promise<number>(resolve => { publishPid = resolve; });
    const second = withTransaction(pool, async client => {
      publishPid((await client.query<{ pid: number }>('SELECT pg_backend_pid() AS pid')).rows[0]!.pid);
      await lockIdentityState(client, { identity: { provider: 'google', subject }, accountIds: [secondId, firstId] });
      await client.query('INSERT INTO holdlog.accounts(id,display_name) VALUES ($1,$2)', [secondId, 'losing fixture']);
      await client.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject) VALUES ($1,$2,$3)', [secondId, 'google', subject]);
    });
    const rejected = assert.rejects(second, { code: '23505' });
    const pid = await pidReady;
    // Observe the actual DB wait rather than assuming asynchronous scheduling reached the lock.
    const deadline = Date.now() + 1000;
    let waiting = false;
    while (Date.now() < deadline) {
      waiting = (await pool.query('SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype=$2 AND NOT granted', [pid, 'advisory'])).rowCount === 1;
      if (waiting) break;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(waiting, true, 'The second identity transaction must wait on the same identity key');
    await first.query('COMMIT'); await rejected;
    assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [secondId])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 1);
  } finally {
    await first.query('ROLLBACK'); first.release();
    await pool.query('DELETE FROM holdlog.accounts WHERE id=ANY($1::uuid[])', [[firstId, secondId]]); await pool.end();
  }
});

void test('DB constraints separate provider identities, preserve nullable installation stubs and reject invalid ownership/version', async () => {
  const pool = createDatabase(integrationConfiguration());
  const accountId = randomUUID(), secondId = randomUUID(), deviceId = randomUUID(), subject = randomUUID();
  try {
    await migrate(pool);
    for (const name of ['', ' \t\n']) await assert.rejects(pool.query('INSERT INTO holdlog.accounts(display_name) VALUES ($1)', [name]), { code: '23514' });
    await assert.rejects(pool.query('INSERT INTO holdlog.accounts(display_name,version) VALUES ($1,0)', ['version fixture']), { code: '23514' });
    await pool.query('INSERT INTO holdlog.accounts(id,display_name) VALUES ($1,$3),($2,$3)', [accountId, secondId, 'same name fixture']);
    // Email is shared deliberately; provider+subject alone defines identity uniqueness.
    await pool.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject,email) VALUES ($1,$3,$4,$5),($2,$6,$4,$5)', [accountId, secondId, 'google', subject, 'synthetic@example.invalid', 'apple']);
    await assert.rejects(pool.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject) VALUES ($1,$2,$3)', [secondId, 'google', subject]), { code: '23505' });
    await assert.rejects(pool.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject) VALUES ($1,$2,$3)', [randomUUID(), 'google', randomUUID()]), { code: '23503' });
    await pool.query('INSERT INTO holdlog.device_installations(id,account_id) VALUES ($1,$2)', [deviceId, accountId]);
    const device = (await pool.query<{ platform: null; push_permission: null; app_version: null; push_token_hash: null; push_token_ciphertext: null }>('SELECT platform,push_permission,app_version,push_token_hash,push_token_ciphertext FROM holdlog.device_installations WHERE id=$1', [deviceId])).rows[0];
    assert.deepEqual(device, { platform: null, push_permission: null, app_version: null, push_token_hash: null, push_token_ciphertext: null });
    await assert.rejects(pool.query('UPDATE holdlog.device_installations SET push_token_hash=$2 WHERE id=$1', [deviceId, hashSecret('synthetic-push')]), { code: '23514' });
    await assert.rejects(pool.query('UPDATE holdlog.device_installations SET version=0 WHERE id=$1', [deviceId]), { code: '23514' });
  } finally {
    await pool.query('DELETE FROM holdlog.device_installations WHERE id=$1', [deviceId]);
    await pool.query('DELETE FROM holdlog.accounts WHERE id=ANY($1::uuid[])', [[accountId, secondId]]); await pool.end();
  }
});

void test('refresh credentials and current-refresh pointers cannot cross session families; account removal cascades secrets', async () => {
  const pool = createDatabase(integrationConfiguration());
  const accountId = randomUUID(), sessionId = randomUUID(), otherSessionId = randomUUID(), family = randomUUID(), otherFamily = randomUUID(), refreshId = randomUUID();
  try {
    await migrate(pool);
    await pool.query('INSERT INTO holdlog.accounts(id,display_name) VALUES ($1,$2)', [accountId, 'session fixture']);
    await pool.query("INSERT INTO holdlog.auth_sessions(id,account_id,token_family_id,expires_at,idle_expires_at,absolute_expires_at) VALUES ($1,$3,$4,now()+interval '15 minutes',now()+interval '30 days',now()+interval '90 days'),($2,$3,$5,now()+interval '15 minutes',now()+interval '30 days',now()+interval '90 days')", [sessionId, otherSessionId, accountId, family, otherFamily]);
    await assert.rejects(pool.query("INSERT INTO holdlog.refresh_credentials(session_id,token_family_id,token_hash,expires_at) VALUES ($1,$2,$3,now()+interval '90 days')", [sessionId, otherFamily, hashSecret('wrong-family')]), { code: '23503' });
    await pool.query("INSERT INTO holdlog.refresh_credentials(id,session_id,token_family_id,token_hash,expires_at) VALUES ($1,$2,$3,$4,now()+interval '90 days')", [refreshId, sessionId, family, hashSecret('synthetic-refresh')]);
    await assert.rejects(withTransaction(pool, async client => { await client.query('UPDATE holdlog.auth_sessions SET current_refresh_credential_id=$2 WHERE id=$1', [otherSessionId, refreshId]); }), { code: '23503' });
    await pool.query('UPDATE holdlog.auth_sessions SET current_refresh_credential_id=$2 WHERE id=$1', [sessionId, refreshId]);
    await pool.query("INSERT INTO holdlog.access_credentials(session_id,token_hash,expires_at) VALUES ($1,$2,now()+interval '15 minutes')", [sessionId, hashSecret('synthetic-access')]);
    await assert.rejects(pool.query("INSERT INTO holdlog.access_credentials(session_id,token_hash,expires_at) VALUES ($1,$2,now()+interval '15 minutes')", [sessionId, 'raw-synthetic-access']), { code: '23514' });
    await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [accountId]);
    assert.equal((await pool.query('SELECT id FROM holdlog.refresh_credentials WHERE id=$1', [refreshId])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.access_credentials WHERE session_id=$1', [sessionId])).rowCount, 0);
  } finally {
    await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [accountId]); await pool.end();
  }
});

void test('failed follow-up migration rolls back DDL and history while preserving the applied identity schema', async () => {
  const pool = createDatabase(integrationConfiguration());
  const directory = await mkdtemp(join(tmpdir(), 'holdlog-identity-migration-'));
  try {
    await migrate(pool);
    const source = new URL('../../db/migrations/', import.meta.url);
    for (const name of await readdir(source)) if (/^\d+_[a-z0-9_]+\.sql$/.test(name)) await writeFile(join(directory, name), await readFile(new URL(name, source), 'utf8'));
    await writeFile(join(directory, '003_failure.sql'), 'CREATE TABLE holdlog.synthetic_failed_migration(id uuid); SELECT * FROM holdlog.synthetic_missing_table;');
    await assert.rejects(migrate(pool, directory));
    assert.equal((await pool.query<{ missing: boolean }>("SELECT to_regclass('holdlog.synthetic_failed_migration') IS NULL AS missing")).rows[0]!.missing, true);
    assert.equal((await pool.query('SELECT version FROM holdlog_foundation.migrations WHERE version=$1', ['003_failure.sql'])).rowCount, 0);
    await migrate(pool);
  } finally { await rm(directory, { recursive: true }); await pool.end(); }
});

void test('identity migration creates the storage boundary and is repeatable without replacing existing accounts', async () => {
  const pool = createDatabase(integrationConfiguration());
  const id = randomUUID();
  try {
    await migrate(pool);
    const result = await pool.query<{ exists: boolean }>("SELECT to_regclass('holdlog.accounts') IS NOT NULL AS exists");
    assert.equal(result.rows[0]?.exists, true);
    await pool.query('INSERT INTO holdlog.accounts(id, display_name) VALUES ($1, $2)', [id, '합성 회원']);
    await migrate(pool);
    assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [id])).rowCount, 1);
    const columns = await pool.query<{ column_name: string }>("SELECT column_name FROM information_schema.columns WHERE table_schema='holdlog'");
    assert.ok(columns.rows.every(row => !['token', 'password', 'response_body', 'id_token', 'signup_token', 'authorization_code'].includes(row.column_name)));
  } finally {
    await pool.query('DELETE FROM holdlog.accounts WHERE id=$1', [id]).catch(() => undefined);
    await pool.end();
  }
});
