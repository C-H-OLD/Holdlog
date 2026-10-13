import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type pg from 'pg';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { integrationConfiguration } from './helpers.js';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { withTransaction } from '../src/database/transaction.js';
import { hashSecret, writeReceipt } from '../src/modules/identity/identity.repository.js';
import { cleanupSignupProofs, registerSignupProofCleanup } from '../src/modules/identity/signup-proof-cleanup.js';
import { createQueue } from '../src/jobs/foundation.js';

/** Create ephemeral proof data without provider calls, for deterministic signup concurrency/rollback cases. */
async function proof(pool: pg.Pool, subject: string, deviceId: string) {
  const token = randomUUID();
  const row = (await pool.query<{ id: string }>("INSERT INTO holdlog.signup_proofs(token_hash,provider,provider_subject,device_id,expires_at) VALUES ($1,'google',$2,$3,now()+interval '15 minutes') RETURNING id", [hashSecret(token), subject, deviceId])).rows[0]!;
  return { id: row.id, signupToken: token, deviceId, name: '가입 회원' };
}

void test('signup entry contention returns409 before the first transaction commits; committed proof never replays tokens', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), key = randomUUID();
  const service = new IdentityService(pool, { verify: () => Promise.reject(new Error('unused')) });
  const fixture = await proof(pool, subject, deviceId), { id, ...input } = fixture;
  const blocker = await pool.connect();
  let first: ReturnType<IdentityService['signup']> | undefined;
  try {
    // A row trigger waits at receipt insert, after account/session/proof changes but before commit.
    await blocker.query('BEGIN'); await blocker.query('SELECT pg_advisory_xact_lock(510030)');
    await pool.query(`CREATE FUNCTION holdlog.test_signup_pause() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.key='${key}'::uuid THEN PERFORM pg_advisory_xact_lock(510030); END IF; RETURN NEW; END $$;
      CREATE TRIGGER test_signup_pause BEFORE INSERT ON holdlog.request_receipts FOR EACH ROW EXECUTE FUNCTION holdlog.test_signup_pause()`);
    first = service.signup(input, key);
    // Observe early failure while waiting for the barrier; the original promise still rejects when awaited.
    void first.catch(() => undefined);
    const observed = await waitForLock(pool); assert.equal(observed, true);
    await assert.rejects(service.signup(input, key.toUpperCase()), { code: 'REQUEST_IN_PROGRESS' });
    await assert.rejects(service.signup({ ...input, name: 'other input' }, key), { code: 'REQUEST_IN_PROGRESS' });
    await blocker.query('COMMIT'); const session = await first;
    await assert.rejects(service.signup(input, key), { code: 'UNAUTHENTICATED' });
    assert.equal((await pool.query('SELECT id FROM holdlog.accounts WHERE id=$1', [session.profile.id])).rowCount, 1);
    assert.equal((await pool.query('SELECT id FROM holdlog.auth_sessions WHERE account_id=$1', [session.profile.id])).rowCount, 1);
    const receipt = (await pool.query('SELECT * FROM holdlog.request_receipts WHERE key=$1', [key])).rows[0] as Record<string, unknown>;
    assert.ok(!JSON.stringify(receipt).includes(session.accessToken)); assert.ok(!JSON.stringify(receipt).includes(input.signupToken));
  } finally {
    await blocker.query('ROLLBACK'); blocker.release();
    await Promise.allSettled(first ? [first] : []);
    await pool.query('DROP TRIGGER IF EXISTS test_signup_pause ON holdlog.request_receipts; DROP FUNCTION IF EXISTS holdlog.test_signup_pause()');
    await clean(pool, subject, deviceId); await pool.query('DELETE FROM holdlog.signup_proofs WHERE id=$1', [id]); await pool.end();
  }
});

/** Observe the actual receipt barrier instead of relying on sleeps or a production test hook. */
async function waitForLock(pool: pg.Pool): Promise<boolean> {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    if ((await pool.query("SELECT 1 FROM pg_locks WHERE locktype='advisory' AND objid=510030 AND NOT granted")).rowCount) return true;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  return false;
}

/** Delete only this synthetic subject's effects, retaining unrelated development/test data. */
async function clean(pool: pg.Pool, subject: string, deviceId: string): Promise<void> {
  await pool.query("DELETE FROM holdlog.request_receipts WHERE principal_id IN (SELECT id FROM holdlog.signup_proofs WHERE provider_subject=$1) OR result_resource_id IN (SELECT account_id FROM holdlog.external_identities WHERE provider_subject=$1)", [subject]);
  await pool.query('DELETE FROM holdlog.accounts WHERE id IN (SELECT account_id FROM holdlog.external_identities WHERE provider_subject=$1)', [subject]);
  await pool.query('DELETE FROM holdlog.device_installations WHERE id=$1', [deviceId]);
  await pool.query('DELETE FROM holdlog.signup_proofs WHERE provider_subject=$1', [subject]);
}

void test('two valid proofs for one identity create exactly one account; the loser commits proof consumption and409 receipt', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), service = new IdentityService(pool, { verify: () => Promise.reject(new Error('unused')) });
  try {
    const { id: firstId, ...first } = await proof(pool, subject, deviceId), { id: secondId, ...second } = await proof(pool, subject, deviceId);
    const results = await Promise.allSettled([service.signup(first, randomUUID()), service.signup(second, randomUUID())]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const denied = results.find(result => result.status === 'rejected'); assert.equal(denied?.status === 'rejected' && (denied.reason as { code: string }).code, 'SIGNUP_ALREADY_COMPLETED');
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 1);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=ANY($1::uuid[]) AND consumed_at IS NOT NULL', [[firstId, secondId]])).rowCount, 2);
    assert.equal((await pool.query("SELECT id FROM holdlog.request_receipts WHERE principal_id=ANY($1::uuid[]) AND error_code='SIGNUP_ALREADY_COMPLETED'", [[firstId, secondId]])).rowCount, 1);
  } finally { await clean(pool, subject, deviceId); await pool.end(); }
});

void test('receipt SQL failure rolls back every signup effect and permits retry with the same proof/key', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), key = randomUUID(), service = new IdentityService(pool, { verify: () => Promise.reject(new Error('unused')) });
  const { id, ...input } = await proof(pool, subject, deviceId);
  try {
    await pool.query(`CREATE FUNCTION holdlog.test_receipt_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.key='${key}'::uuid THEN RAISE EXCEPTION 'synthetic receipt failure'; END IF; RETURN NEW; END $$;
      CREATE TRIGGER test_receipt_failure BEFORE INSERT ON holdlog.request_receipts FOR EACH ROW EXECUTE FUNCTION holdlog.test_receipt_failure()`);
    await assert.rejects(service.signup(input, key));
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.device_installations WHERE id=$1', [deviceId])).rowCount, 0);
    assert.equal((await pool.query<{ consumed_at: Date | null }>('SELECT consumed_at FROM holdlog.signup_proofs WHERE id=$1', [id])).rows[0]?.consumed_at, null);
    await pool.query('DROP TRIGGER test_receipt_failure ON holdlog.request_receipts; DROP FUNCTION holdlog.test_receipt_failure()');
    const result = await service.signup(input, key); assert.equal(result.profile.name, input.name);
  } finally {
    await pool.query('DROP TRIGGER IF EXISTS test_receipt_failure ON holdlog.request_receipts; DROP FUNCTION IF EXISTS holdlog.test_receipt_failure()');
    await clean(pool, subject, deviceId); await pool.end();
  }
});

void test('proof cleanup removes consumed/expired identity data, skips locked rows, preserves receipts and repeats safely', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), locked = await pool.connect(), receiptKey = randomUUID();
  try {
    const live = await proof(pool, subject, deviceId), expired = await proof(pool, subject, deviceId), consumed = await proof(pool, subject, deviceId);
    await pool.query("UPDATE holdlog.signup_proofs SET created_at=now()-interval '1 day',expires_at=now()-interval '1 second' WHERE id=$1", [expired.id]);
    await pool.query('UPDATE holdlog.signup_proofs SET consumed_at=now() WHERE id=$1', [consumed.id]);
    await withTransaction(pool, client => writeReceipt(client, { principalScope: 'signup', principalId: consumed.id, operation: 'completeSignup', key: receiptKey, requestHash: hashSecret('synthetic-request'), resultStatus: 409, errorCode: 'SIGNUP_ALREADY_COMPLETED' }));
    await locked.query('BEGIN'); await locked.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1 FOR UPDATE', [expired.id]);
    await cleanupSignupProofs(pool);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [live.id])).rowCount, 1);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [expired.id])).rowCount, 1);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [consumed.id])).rowCount, 0);
    await locked.query('COMMIT'); await cleanupSignupProofs(pool); await cleanupSignupProofs(pool);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [expired.id])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.request_receipts WHERE key=$1', [receiptKey])).rowCount, 1);
  } finally { await locked.query('ROLLBACK'); locked.release(); await pool.query('DELETE FROM holdlog.request_receipts WHERE key=$1', [receiptKey]); await clean(pool, subject, deviceId); await pool.end(); }
});

void test('scheduled proof cleanup runs through pg-boss and preserves active proofs', async () => {
  const config = integrationConfiguration(), pool = createDatabase(config), boss = createQueue(config);
  await migrate(pool); await boss.start();
  const subject = randomUUID(), deviceId = randomUUID();
  try {
    const expired = await proof(pool, subject, deviceId), live = await proof(pool, subject, deviceId);
    await pool.query('UPDATE holdlog.signup_proofs SET consumed_at=now() WHERE id=$1', [expired.id]);
    await registerSignupProofCleanup(boss, pool);
    await boss.send('signup-proof-cleanup', {});
    const deadline = Date.now() + 5000;
    while ((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [expired.id])).rowCount && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [expired.id])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [live.id])).rowCount, 1);
    assert.ok((await boss.getSchedules()).some(schedule => schedule.name === 'signup-proof-cleanup'));
  } finally { await boss.stop(); await clean(pool, subject, deviceId); await pool.end(); }
});

void test('proof and challenge expiry during identity-lock waits are rechecked using statement time', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), blocker = await pool.connect();
  const service = new IdentityService(pool, { verify: input => Promise.resolve({ provider: input.provider, subject, email: null }) });
  const { id, ...input } = await proof(pool, subject, deviceId);
  const { lockIdentityState } = await import('../src/modules/identity/identity.repository.js');
  let pending: Promise<unknown> | undefined;
  try {
    await blocker.query('BEGIN'); await lockIdentityState(blocker, { identity: { provider: 'google', subject } });
    pending = service.signup(input, randomUUID()); const rejected = assert.rejects(pending, { code: 'UNAUTHENTICATED' });
    await waitForAnyIdentityLock(pool);
    await pool.query("UPDATE holdlog.signup_proofs SET created_at=now()-interval '1 day',expires_at=statement_timestamp()-interval '1 microsecond' WHERE id=$1", [id]);
    await blocker.query('COMMIT'); await rejected;
    const challenge = await service.challenge();
    await blocker.query('BEGIN'); await lockIdentityState(blocker, { identity: { provider: 'google', subject } });
    pending = service.login({ provider: 'google', idToken: 'fixture', deviceId, challengeId: challenge.challengeId, authorizationCode: null });
    const loginRejected = assert.rejects(pending, { code: 'UNAUTHENTICATED' });
    await waitForAnyIdentityLock(pool);
    await pool.query("UPDATE holdlog.login_challenges SET created_at=now()-interval '1 day',expires_at=statement_timestamp()-interval '1 microsecond' WHERE id=$1", [challenge.challengeId]);
    await blocker.query('COMMIT'); await loginRejected;
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 0);
  } finally { await blocker.query('ROLLBACK'); blocker.release(); await Promise.allSettled(pending ? [pending] : []); await clean(pool, subject, deviceId); await pool.end(); }
});

/** Wait for an actual transaction advisory wait before moving expiry across the boundary. */
async function waitForAnyIdentityLock(pool: pg.Pool): Promise<void> {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    if ((await pool.query("SELECT 1 FROM pg_locks WHERE locktype='advisory' AND NOT granted")).rowCount) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.fail('Expected an identity lock wait');
}

void test('unique collision rolls back the first account and rechecks proof/identity on a fresh transaction', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), service = new IdentityService(pool, { verify: () => Promise.reject(new Error('unused')) });
  const { id, ...input } = await proof(pool, subject, deviceId);
  try {
    // Sequences are nontransactional: fail only the first insert without adding a production retry hook.
    await pool.query(`CREATE SEQUENCE holdlog.test_unique_attempt;
      CREATE FUNCTION holdlog.test_unique_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.provider_subject='${subject}' AND nextval('holdlog.test_unique_attempt')=1 THEN RAISE unique_violation; END IF; RETURN NEW; END $$;
      CREATE TRIGGER test_unique_failure BEFORE INSERT ON holdlog.external_identities FOR EACH ROW EXECUTE FUNCTION holdlog.test_unique_failure()`);
    const result = await service.signup(input, randomUUID());
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 1);
    assert.equal((await pool.query('SELECT id FROM holdlog.auth_sessions WHERE account_id=$1', [result.profile.id])).rowCount, 1);
    assert.equal((await pool.query<{ consumed: boolean }>('SELECT consumed_at IS NOT NULL AS consumed FROM holdlog.signup_proofs WHERE id=$1', [id])).rows[0]?.consumed, true);
  } finally {
    await pool.query('DROP TRIGGER IF EXISTS test_unique_failure ON holdlog.external_identities; DROP FUNCTION IF EXISTS holdlog.test_unique_failure(); DROP SEQUENCE IF EXISTS holdlog.test_unique_attempt');
    await clean(pool, subject, deviceId); await pool.end();
  }
});

void test('signup proof expires while waiting for the installation and rolls back provisional account/session', async () => {
  const pool = createDatabase(integrationConfiguration()); await migrate(pool);
  const subject = randomUUID(), deviceId = randomUUID(), blocker = await pool.connect();
  const service = new IdentityService(pool, { verify: () => Promise.reject(new Error('unused')) });
  const { id, ...input } = await proof(pool, subject, deviceId);
  const { lockDevice } = await import('../src/modules/identity/identity.repository.js');
  let pending: Promise<unknown> | undefined;
  try {
    await blocker.query('BEGIN'); await lockDevice(blocker, deviceId);
    await pool.query("UPDATE holdlog.signup_proofs SET created_at=statement_timestamp()-interval '15 minutes'+interval '500 milliseconds',expires_at=statement_timestamp()+interval '500 milliseconds' WHERE id=$1", [id]);
    pending = service.signup(input, randomUUID()); const denied = assert.rejects(pending, { code: 'UNAUTHENTICATED' });
    await waitForAnyIdentityLock(pool); await pool.query('SELECT pg_sleep(0.55)'); await blocker.query('COMMIT'); await denied;
    assert.equal((await pool.query('SELECT id FROM holdlog.external_identities WHERE provider_subject=$1', [subject])).rowCount, 0);
    assert.equal((await pool.query('SELECT id FROM holdlog.auth_sessions WHERE device_id=$1', [deviceId])).rowCount, 0);
  } finally { await blocker.query('ROLLBACK'); blocker.release(); await Promise.allSettled(pending ? [pending] : []); await clean(pool, subject, deviceId); await pool.end(); }
});

void test('proof cleanup failure retries independently and stores no identity detail in the job failure', async () => {
  const config = integrationConfiguration(), pool = createDatabase(config), boss = createQueue(config);
  const subject = randomUUID(), deviceId = randomUUID();
  let restoreSchedule = false;
  try {
    await migrate(pool); await boss.start();
    await boss.createQueue('signup-proof-cleanup');
    restoreSchedule = true;
    await boss.unschedule('signup-proof-cleanup');
    await boss.deleteAllJobs('signup-proof-cleanup');
    await registerSignupProofCleanup(boss, pool);
    await boss.unschedule('signup-proof-cleanup');
    await boss.deleteQueuedJobs('signup-proof-cleanup');
    const stale = await proof(pool, subject, deviceId);
    await pool.query('UPDATE holdlog.signup_proofs SET consumed_at=now() WHERE id=$1', [stale.id]);
    await pool.query(`CREATE SEQUENCE holdlog.test_cleanup_attempt;
      CREATE FUNCTION holdlog.test_cleanup_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.provider_subject='${subject}' AND nextval('holdlog.test_cleanup_attempt')=1 THEN RAISE EXCEPTION '${subject}'; END IF; RETURN OLD; END $$;
      CREATE TRIGGER test_cleanup_failure BEFORE DELETE ON holdlog.signup_proofs FOR EACH ROW EXECUTE FUNCTION holdlog.test_cleanup_failure()`);
    const id = await boss.send('signup-proof-cleanup', {}, { retryDelay: 1 }); assert.ok(id);
    const deadline = Date.now() + 7000; let completed = false;
    while (Date.now() < deadline) {
      const job = await boss.getJobById('signup-proof-cleanup', id);
      if (job?.state === 'retry') assert.ok(!JSON.stringify(job.output).includes(subject));
      if (job?.state === 'completed') { assert.ok(job.retryCount >= 1); completed = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.equal(completed, true);
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [stale.id])).rowCount, 0);
  } finally {
    try {
      if (restoreSchedule) await boss.schedule('signup-proof-cleanup', '* * * * *', {});
    } finally {
      try { await boss.stop(); }
      finally {
        try {
          await pool.query('DROP TRIGGER IF EXISTS test_cleanup_failure ON holdlog.signup_proofs; DROP FUNCTION IF EXISTS holdlog.test_cleanup_failure(); DROP SEQUENCE IF EXISTS holdlog.test_cleanup_attempt');
          await clean(pool, subject, deviceId);
        } finally { await pool.end(); }
      }
    }
  }
});

void test('production worker registration executes proof cleanup without registering the development synthetic queue', async () => {
  const config = { ...integrationConfiguration(), environment: 'production' as const, queue: 'production-must-not-create-' + randomUUID() };
  const pool = createDatabase(config), boss = createQueue(config);
  await migrate(pool); await boss.start();
  const subject = randomUUID(), deviceId = randomUUID(), stale = await proof(pool, subject, deviceId);
  try {
    const { registerApplicationWorkers } = await import('../src/jobs/register.js');
    await pool.query('UPDATE holdlog.signup_proofs SET consumed_at=now() WHERE id=$1', [stale.id]);
    await registerApplicationWorkers(boss, pool, config);
    assert.equal(await boss.getQueue(config.queue), null);
    assert.ok((await boss.getSchedules()).some(schedule => schedule.name === 'signup-proof-cleanup'));
    await boss.send('signup-proof-cleanup', {});
    const deadline = Date.now() + 5000;
    while ((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [stale.id])).rowCount && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal((await pool.query('SELECT id FROM holdlog.signup_proofs WHERE id=$1', [stale.id])).rowCount, 0);
  } finally { await boss.stop(); await clean(pool, subject, deviceId); await pool.end(); }
});
