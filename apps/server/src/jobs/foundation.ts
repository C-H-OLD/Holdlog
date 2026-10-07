import { PgBoss } from 'pg-boss';
import type pg from 'pg';
import type { Configuration } from '../config/environment.js';
import { logEvent } from '../config/logging.js';

/** Create pg-boss on the configured local DB; its internal schema belongs to the library. */
export function createQueue(config: Configuration): PgBoss {
  const boss = new PgBoss({ connectionString: config.databaseUrl, schema: 'pgboss', application_name: 'holdlog-foundation-worker', connectionTimeoutMillis: 2000, monitorIntervalSeconds: 1 });
  boss.on('error', () => logEvent('worker.failed'));
  return boss;
}

/**
 * Commit one synthetic effect per pg-boss job UUID. Re-delivery returns false with no new effect.
 * Throws on DB/UUID errors. This marker models retry safety; it performs no product work.
 */
export async function recordEffect(pool: pg.Pool, jobId: string): Promise<boolean> {
  const result = await pool.query('INSERT INTO holdlog_foundation.job_effects(job_id) VALUES ($1) ON CONFLICT (job_id) DO NOTHING', [jobId]);
  return result.rowCount === 1;
}

/** Register the synthetic queue and handler; call boss.stop before closing the effect pool. */
export async function registerWorker(boss: PgBoss, pool: pg.Pool, queue: string): Promise<void> {
  await boss.createQueue(queue, { retryLimit: 3, retryDelay: 1, expireInSeconds: 30 });
  await boss.work(queue, { pollingIntervalSeconds: 0.5 }, async jobs => {
    for (const job of jobs) {
      try { await recordEffect(pool, job.id); }
      catch { throw new Error('Synthetic effect unavailable'); }
    }
  });
}
