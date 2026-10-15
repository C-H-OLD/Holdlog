import type Database from 'better-sqlite3';
import { logEvent } from '../../config/logging.js';
import { withTransaction } from '../../database/transaction.js';
import { deleteStaleProofs } from './identity.repository.js';

/** Remove one bounded batch of expired/consumed proofs in one IMMEDIATE transaction and return the count; valid proofs and receipts survive. */
export function cleanupSignupProofs(db: Database.Database): number { return withTransaction(db, () => deleteStaleProofs(db)); }

/**
 * Run proof cleanup once now and then every intervalMs in this worker process, independent of the API.
 * A failure logs only the fixed worker.failed category (never identity or proof details) and waits for the next tick.
 * Returns a function that stops the timer.
 */
export function startSignupProofCleanup(db: Database.Database, intervalMs = 60_000): () => void {
  /** Run one batch; failures are reported by category only. */
  const tick = (): void => {
    try { cleanupSignupProofs(db); }
    catch { logEvent('worker.failed'); }
  };
  tick();
  const timer = setInterval(tick, intervalMs);
  return () => { clearInterval(timer); };
}
