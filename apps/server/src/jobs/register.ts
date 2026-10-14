import type { PgBoss } from 'pg-boss';
import type pg from 'pg';
import type { Configuration } from '../config/environment.js';
import { registerWorker } from './foundation.js';
import { registerSignupProofCleanup } from '../modules/identity/signup-proof-cleanup.js';

/** Register application handlers after queue startup; caller owns queue/pool lifetime and startup failure cleanup. */
export async function registerApplicationWorkers(boss: PgBoss, pool: pg.Pool, config: Configuration): Promise<void> {
  // Product proof cleanup runs in every environment; synthetic effects are restricted to development/test.
  if (config.environment !== 'production') await registerWorker(boss, pool, config.queue);
  await registerSignupProofCleanup(boss, pool);
}
