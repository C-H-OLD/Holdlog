import type { PgBoss } from 'pg-boss';
import type pg from 'pg';

/**
 * Close queue and pool after startup failure, even if either cleanup rejects.
 * Always rejects with the original startup error; cleanup values are never logged.
 */
export async function cleanupStartupFailure(boss: Pick<PgBoss, 'stop'>, pool: Pick<pg.Pool, 'end'>, originalError: unknown): Promise<never> {
  try { await boss.stop({ graceful: false }); }
  catch { /* Cleanup must not replace the original startup failure. */ }
  finally { await pool.end().catch(() => undefined); }
  throw originalError;
}
