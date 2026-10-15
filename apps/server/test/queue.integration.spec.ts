import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type Database from 'better-sqlite3';
import { withTransaction } from '../src/database/transaction.js';
import { claim, complete, enqueue, fail } from '../src/jobs/queue.js';
import { startQueue } from '../src/jobs/runner.js';
import { isoFromNow, testDatabase } from './helpers.js';

interface JobState { state: string; attempts: number; available_at: string; last_error_code: string | null; claim_id: string | null; lease_expires_at: string | null; finished_at: string | null }
/** Read the stored state of one job. */
function job(db: Database.Database, id: string): JobState { return db.prepare<[string], JobState>('SELECT state, attempts, available_at, last_error_code, claim_id, lease_expires_at, finished_at FROM jobs WHERE id=?').get(id)!; }
/** Enqueue one job in its own transaction and return its id. */
function add(db: Database.Database, queue: string, maxAttempts: number): string {
  const jobKey = 'job-' + randomUUID();
  withTransaction(db, () => enqueue(db, { queue, jobKey, maxAttempts }));
  return db.prepare<[string], { id: string }>('SELECT id FROM jobs WHERE job_key=?').get(jobKey)!.id;
}

void test('a job key is enqueued once, enqueue needs the caller transaction and the table rejects bad queues', () => {
  const { db, close } = testDatabase();
  try {
    const jobKey = 'job-' + randomUUID();
    assert.equal(withTransaction(db, () => enqueue(db, { queue: 'foundation-check', jobKey, maxAttempts: 2 })), true);
    assert.equal(withTransaction(db, () => enqueue(db, { queue: 'foundation-check', jobKey, payload: { different: true }, maxAttempts: 2 })), false);
    assert.equal(db.prepare('SELECT id FROM jobs WHERE job_key=?').all(jobKey).length, 1);
    assert.throws(() => enqueue(db, { queue: 'foundation-check', jobKey: 'outside-' + randomUUID(), maxAttempts: 2 }), /transaction/);
    assert.throws(() => withTransaction(db, () => enqueue(db, { queue: 'Bad Queue', jobKey: 'bad-' + randomUUID(), maxAttempts: 2 })), { code: 'SQLITE_CONSTRAINT_CHECK' });
  } finally { close(); }
});

void test('claims follow available time, then id, and skip jobs that are not yet available', () => {
  const { db, close } = testDatabase();
  const ids = ['00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000004'];
  try {
    const insert = db.prepare('INSERT INTO jobs (id, queue, job_key, max_attempts, available_at) VALUES (?, ?, ?, 1, ?)');
    const earlier = isoFromNow(-2000), later = isoFromNow(-1000);
    insert.run(ids[0], 'order-check', 'order-a', later);
    insert.run(ids[1], 'order-check', 'order-b', later);
    insert.run(ids[2], 'order-check', 'order-c', earlier);
    insert.run(ids[3], 'order-check', 'order-d', isoFromNow(60_000));
    assert.deepEqual([claim(db, 'order-check', 60_000)?.id, claim(db, 'order-check', 60_000)?.id, claim(db, 'order-check', 60_000)?.id], [ids[2], ids[1], ids[0]]);
    assert.equal(claim(db, 'order-check', 60_000), undefined);
  } finally { close(); }
});

void test('a late completion after the lease was re-claimed changes nothing (fencing)', () => {
  const { db, close } = testDatabase();
  try {
    const id = add(db, 'fence-check', 3);
    const first = claim(db, 'fence-check', 60_000)!;
    db.prepare('UPDATE jobs SET lease_expires_at=? WHERE id=?').run(isoFromNow(-1), id);
    const second = claim(db, 'fence-check', 60_000)!;
    assert.equal(second.id, id); assert.notEqual(second.claimId, first.claimId); assert.equal(second.attempts, 2);
    assert.equal(complete(db, id, first.claimId), false);
    assert.equal(fail(db, id, first.claimId, 'HANDLER_FAILED', 1000), false);
    assert.equal(job(db, id).state, 'running');
    assert.equal(complete(db, id, second.claimId), true);
    const row = job(db, id);
    assert.equal(row.state, 'completed'); assert.ok(row.finished_at); assert.equal(row.claim_id, null); assert.equal(row.lease_expires_at, null);
  } finally { close(); }
});

void test('failures back off 1, 2 and 4 seconds and the last attempt fails with its category', () => {
  const { db, close } = testDatabase();
  try {
    const id = add(db, 'retry-check', 4);
    for (const expected of [1000, 2000, 4000]) {
      const claimed = claim(db, 'retry-check', 60_000)!;
      const before = Date.now();
      assert.equal(fail(db, id, claimed.claimId, 'HANDLER_FAILED', 1000), true);
      const row = job(db, id), wait = Date.parse(row.available_at) - before;
      assert.equal(row.state, 'queued'); assert.equal(row.last_error_code, 'HANDLER_FAILED'); assert.equal(row.claim_id, null);
      assert.ok(wait >= expected - 50 && wait <= expected + 1000, `expected about ${expected} ms, got ${wait}`);
      assert.equal(claim(db, 'retry-check', 60_000), undefined);
      db.prepare('UPDATE jobs SET available_at=? WHERE id=?').run(isoFromNow(-1), id);
    }
    const last = claim(db, 'retry-check', 60_000)!; assert.equal(last.attempts, 4);
    assert.throws(() => fail(db, id, last.claimId, 'free text with details', 1000), { code: 'SQLITE_CONSTRAINT_CHECK' });
    assert.equal(fail(db, id, last.claimId, 'HANDLER_FAILED', 1000), true);
    const row = job(db, id);
    assert.equal(row.state, 'failed'); assert.ok(row.finished_at); assert.equal(row.last_error_code, 'HANDLER_FAILED');
    assert.equal(claim(db, 'retry-check', 60_000), undefined);
  } finally { close(); }
});

void test('an exhausted job whose lease expired is failed with LEASE_EXPIRED on the next claim', () => {
  const { db, close } = testDatabase();
  try {
    const id = add(db, 'lease-check', 1);
    assert.ok(claim(db, 'lease-check', 60_000));
    db.prepare('UPDATE jobs SET lease_expires_at=? WHERE id=?').run(isoFromNow(-1), id);
    assert.equal(claim(db, 'lease-check', 60_000), undefined);
    const row = job(db, id);
    assert.equal(row.state, 'failed'); assert.equal(row.last_error_code, 'LEASE_EXPIRED'); assert.ok(row.finished_at); assert.equal(row.claim_id, null);
  } finally { close(); }
});

void test('stop waits for the active handler, then aborts it without recording the job', async () => {
  const { db, close } = testDatabase();
  try {
    const id = add(db, 'stop-check', 3);
    const entered = Promise.withResolvers<void>(), settled = Promise.withResolvers<void>();
    const runner = startQueue(db, 'stop-check', { baseDelayMs: 10, maxAttempts: 3, leaseMs: 60_000 }, async (_job, signal) => {
      entered.resolve();
      await new Promise<void>(resolve => signal.addEventListener('abort', () => resolve(), { once: true }));
      settled.resolve();
      throw new Error('synthetic interruption');
    }, 10);
    await entered.promise;
    const started = Date.now();
    await runner.stop(100);
    assert.ok(Date.now() - started >= 90, 'stop must wait before aborting');
    await settled.promise;
    await new Promise(resolve => setTimeout(resolve, 20));
    const row = job(db, id);
    assert.equal(row.state, 'running'); assert.equal(row.attempts, 1); assert.equal(row.last_error_code, null);
  } finally { close(); }
});

void test('stop lets a handler that finishes within the wait complete its job', async () => {
  const { db, close } = testDatabase();
  try {
    const id = add(db, 'drain-check', 3);
    const entered = Promise.withResolvers<void>();
    const runner = startQueue(db, 'drain-check', { baseDelayMs: 10, maxAttempts: 3, leaseMs: 60_000 }, async () => {
      entered.resolve();
      await new Promise(resolve => setTimeout(resolve, 50));
    }, 10);
    await entered.promise;
    await runner.stop(1000);
    const row = job(db, id);
    assert.equal(row.state, 'completed'); assert.ok(row.finished_at);
  } finally { close(); }
});
