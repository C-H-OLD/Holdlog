import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type Database from 'better-sqlite3';
import { withTransaction } from '../src/database/transaction.js';
import { recordEffect, startFoundationQueue } from '../src/jobs/foundation.js';
import { enqueue, type QueuePolicy } from '../src/jobs/queue.js';
import { registerApplicationWorkers } from '../src/jobs/register.js';
import { startQueue, type QueueRunner } from '../src/jobs/runner.js';
import { testDatabase, waitFor } from './helpers.js';

// Short lease and backoff keep lease-expiry recovery within a few hundred milliseconds.
const policy: QueuePolicy = { baseDelayMs: 50, maxAttempts: 4, leaseMs: 500 };

/** Enqueue one synthetic job in its own transaction and return its id. */
function add(db: Database.Database, queue: string): string {
  const jobKey = 'job-' + randomUUID();
  withTransaction(db, () => enqueue(db, { queue, jobKey, maxAttempts: policy.maxAttempts }));
  return db.prepare<[string], { id: string }>('SELECT id FROM jobs WHERE job_key=?').get(jobKey)!.id;
}
/** Read the state and attempts of one job. */
function job(db: Database.Database, id: string): { state: string; attempts: number } { return db.prepare<[string], { state: string; attempts: number }>('SELECT state, attempts FROM jobs WHERE id=?').get(id)!; }
/** Count synthetic effects of one job. */
function effects(db: Database.Database, id: string): number { return db.prepare('SELECT job_id FROM job_effects WHERE job_id=?').all(id).length; }

void test('an interrupted runner leaves the job to lease expiry and another runner completes it without repeating the effect', { timeout: 20_000 }, async () => {
  const { db, close } = testDatabase();
  const queue = 'foundation-' + randomUUID().slice(0, 8), id = add(db, queue);
  const entered = Promise.withResolvers<void>();
  const first = startQueue(db, queue, policy, async (claimed, signal) => {
    recordEffect(db, claimed.id);
    entered.resolve();
    // Keep the handler active until stop aborts it, modelling a crash after the effect committed.
    await new Promise<void>(resolve => signal.addEventListener('abort', () => resolve(), { once: true }));
    throw new Error('synthetic interruption');
  }, 20);
  let second: QueueRunner | undefined;
  try {
    await entered.promise;
    await first.stop(50);
    second = startFoundationQueue(db, queue, policy, 20);
    assert.ok(await waitFor(() => job(db, id).state === 'completed', 5000), 'interrupted job must complete after its lease expires');
    assert.ok(job(db, id).attempts >= 2);
    assert.equal(effects(db, id), 1);
    assert.equal(recordEffect(db, id), false);
    assert.equal(effects(db, id), 1);
  } finally { await second?.stop(100); close(); }
});

void test('SIGKILL after the effect commit recovers the expired running job in a new runner', { timeout: 20_000 }, async () => {
  const { config, db, close } = testDatabase();
  const queue = 'foundation-' + randomUUID().slice(0, 8), id = add(db, queue);
  const child = fork(new URL('./interrupted-worker.js', import.meta.url), [config.databasePath, queue], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
  let runner: QueueRunner | undefined;
  try {
    const message = await once(child, 'message', { signal: AbortSignal.timeout(10_000) });
    assert.equal(message[0], id);
    const exit = once(child, 'exit');
    child.kill('SIGKILL');
    const result = await exit;
    assert.equal(result[1], 'SIGKILL');
    runner = startFoundationQueue(db, queue, policy, 20);
    assert.ok(await waitFor(() => job(db, id).state === 'completed', 5000), 'abruptly interrupted job must recover');
    assert.ok(job(db, id).attempts >= 2);
    assert.equal(effects(db, id), 1);
  } finally { child.kill('SIGKILL'); await runner?.stop(100); close(); }
});

void test('development/test registration runs the synthetic queue and stops cleanly', async () => {
  const { config, db, close } = testDatabase();
  const workers = registerApplicationWorkers(db, config, { pollMs: 10, cleanupMs: 60_000, foundation: policy });
  try {
    const id = add(db, config.queue);
    assert.ok(await waitFor(() => job(db, id).state === 'completed', 2000));
    assert.equal(effects(db, id), 1);
  } finally { await workers.stop(100); close(); }
});
