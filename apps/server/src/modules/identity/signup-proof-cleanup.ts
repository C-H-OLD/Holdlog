import type pg from 'pg';
import type { PgBoss } from 'pg-boss';
import { withTransaction } from '../../database/transaction.js';
import { deleteStaleProofs } from './identity.repository.js';

/** Remove a bounded batch of expired/consumed proofs on one client; locked proofs and valid proofs survive. */
export async function cleanupSignupProofs(pool: pg.Pool): Promise<number> { return withTransaction(pool, deleteStaleProofs); }

/** Register independent minute cleanup with pg-boss retries; errors never log identity or proof secrets. */
export async function registerSignupProofCleanup(boss: PgBoss, pool: pg.Pool): Promise<void> {
  const queue = 'signup-proof-cleanup';
  await boss.createQueue(queue, { retryLimit: 3, retryDelay: 5, expireInSeconds: 60 });
  await boss.work(queue, { pollingIntervalSeconds: 0.5 }, async () => {
    try { await cleanupSignupProofs(pool); }
    catch { throw new Error('Signup proof cleanup unavailable'); }
  });
  await boss.schedule(queue, '* * * * *', {});
}
