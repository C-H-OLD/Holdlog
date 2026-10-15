import type Database from 'better-sqlite3';
import { asPromise, withTransaction } from '../database/transaction.js';
import type { QueuePolicy } from './queue.js';
import { startQueue, type QueueRunner } from './runner.js';

/** Synthetic queue policy with the former pg-boss numbers: 4 runs (3 retries), 1 s base backoff, 30 s lease. */
export const foundationPolicy: QueuePolicy = { baseDelayMs: 1000, maxAttempts: 4, leaseMs: 30_000 };

/**
 * Commit one synthetic effect per job id. Re-delivery returns false with no new effect.
 * Throws on DB/UUID errors. This marker models retry safety; it performs no product work.
 */
export function recordEffect(db: Database.Database, jobId: string): boolean {
  return withTransaction(db, () => db.prepare('INSERT INTO job_effects (job_id) VALUES (?) ON CONFLICT (job_id) DO NOTHING').run(jobId).changes === 1);
}

/** Start the development/test synthetic queue; an effect failure surfaces as a fixed error without DB details. */
export function startFoundationQueue(db: Database.Database, queue: string, policy: QueuePolicy = foundationPolicy, pollMs = 500): QueueRunner {
  return startQueue(db, queue, policy, job => asPromise(() => {
    try { recordEffect(db, job.id); }
    catch { throw new Error('Synthetic effect unavailable'); }
  }), pollMs);
}
