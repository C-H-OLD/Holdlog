import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { afterMilliseconds, now, TIME_FORMAT } from '../database/time.js';
import { withTransaction } from '../database/transaction.js';

/** Per-queue retry policy. maxAttempts counts the first run and is copied into each row at enqueue time. */
export interface QueuePolicy { baseDelayMs: number; maxAttempts: number; leaseMs: number }
/** A claimed job; claimId fences this run's completion against a later re-claim. */
export interface ClaimedJob { id: string; jobKey: string; payload: unknown; attempts: number; maxAttempts: number; claimId: string }
interface JobRow { id: string; job_key: string; payload: string; attempts: number; max_attempts: number; claim_id: string }

/**
 * Enqueue once per jobKey inside the caller's IMMEDIATE transaction.
 * Product jobs arrive only through the outbox dispatcher after the business commit (docs/architecture/server.md); services do not call this directly.
 * A repeated jobKey is ignored (redelivered outbox entries reuse their key). payload is JSON without personal data or secrets.
 * Returns true only when a row was inserted. Throws outside a transaction or when a table CHECK rejects the queue/key.
 */
export function enqueue(db: Database.Database, job: { queue: string; jobKey: string; payload?: unknown; maxAttempts: number }): boolean {
  if (!db.inTransaction) throw new Error('enqueue requires the caller transaction');
  return db.prepare('INSERT INTO jobs (id, queue, job_key, payload, max_attempts) VALUES (?, ?, ?, ?, ?) ON CONFLICT (job_key) DO NOTHING')
    .run(randomUUID(), job.queue, job.jobKey, JSON.stringify(job.payload ?? {}), job.maxAttempts).changes === 1;
}

/**
 * Claim one due job of a queue in one IMMEDIATE transaction, after failing exhausted runs whose lease expired (LEASE_EXPIRED).
 * Due means queued and available, or running with an expired lease and attempts left (recovery after a crash or abort).
 * Order is available_at, then id. Each claim gets a fresh claimId. Returns undefined when nothing is due.
 */
export function claim(db: Database.Database, queue: string, leaseMs: number): ClaimedJob | undefined {
  return withTransaction(db, () => {
    db.prepare(`UPDATE jobs SET state='failed', last_error_code='LEASE_EXPIRED', finished_at=${now()}, claim_id=NULL, lease_expires_at=NULL
      WHERE queue=? AND state='running' AND lease_expires_at <= ${now()} AND attempts >= max_attempts`).run(queue);
    const row = db.prepare<[string, string, string], JobRow>(`UPDATE jobs SET state='running', attempts=attempts+1, claim_id=?, lease_expires_at=strftime('${TIME_FORMAT}', 'now', ?)
      WHERE id=(SELECT id FROM jobs WHERE queue=?
        AND ((state='queued' AND available_at <= ${now()}) OR (state='running' AND lease_expires_at <= ${now()} AND attempts < max_attempts))
        ORDER BY available_at, id LIMIT 1)
      RETURNING id, job_key, payload, attempts, max_attempts, claim_id`).get(randomUUID(), afterMilliseconds(leaseMs), queue);
    return row && { id: row.id, jobKey: row.job_key, payload: JSON.parse(row.payload) as unknown, attempts: row.attempts, maxAttempts: row.max_attempts, claimId: row.claim_id };
  });
}

/** Complete the current claim only; a late runner whose lease was re-claimed changes nothing and gets false. */
export function complete(db: Database.Database, id: string, claimId: string): boolean {
  return withTransaction(db, () => db.prepare(`UPDATE jobs SET state='completed', finished_at=${now()}, claim_id=NULL, lease_expires_at=NULL
    WHERE id=? AND claim_id=? AND state='running'`).run(id, claimId).changes === 1);
}

/**
 * Record a failed run of the current claim with a fixed error category (A-Z, 0-9, _). While attempts remain the job is
 * queued again after baseDelayMs × 2^(attempts−1); otherwise it is failed with finished_at. Failed rows are kept.
 * Returns false (no change) for a fenced claim.
 */
export function fail(db: Database.Database, id: string, claimId: string, code: string, baseDelayMs: number): boolean {
  return withTransaction(db, () => {
    const job = db.prepare<[string, string], { attempts: number; max_attempts: number }>("SELECT attempts, max_attempts FROM jobs WHERE id=? AND claim_id=? AND state='running'").get(id, claimId);
    if (!job) return false;
    if (job.attempts < job.max_attempts) {
      db.prepare(`UPDATE jobs SET state='queued', available_at=strftime('${TIME_FORMAT}', 'now', ?), last_error_code=?, claim_id=NULL, lease_expires_at=NULL WHERE id=?`)
        .run(afterMilliseconds(baseDelayMs * 2 ** (job.attempts - 1)), code, id);
    } else {
      db.prepare(`UPDATE jobs SET state='failed', finished_at=${now()}, last_error_code=?, claim_id=NULL, lease_expires_at=NULL WHERE id=?`).run(code, id);
    }
    return true;
  });
}
