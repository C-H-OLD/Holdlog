import type Database from 'better-sqlite3';
import type { Configuration } from '../config/environment.js';
import { startSignupProofCleanup } from '../modules/identity/signup-proof-cleanup.js';
import { foundationPolicy, startFoundationQueue } from './foundation.js';
import type { QueuePolicy } from './queue.js';
import type { QueueRunner } from './runner.js';

/** Loop timings; production uses the defaults and tests pass shorter values. */
export interface WorkerTimings { pollMs: number; cleanupMs: number; foundation: QueuePolicy }
export const defaultTimings: WorkerTimings = { pollMs: 500, cleanupMs: 60_000, foundation: foundationPolicy };

/**
 * Start application loops after migration; the caller owns the connection and closes it after stop().
 * stop() first clears the cleanup timer, then stops each queue (wait up to waitMs, then abort unrecorded).
 */
export function registerApplicationWorkers(db: Database.Database, config: Configuration, timings: WorkerTimings = defaultTimings): QueueRunner {
  // Product proof cleanup runs in every environment; synthetic effects are restricted to development/test.
  const stopCleanup = startSignupProofCleanup(db, timings.cleanupMs);
  const queues = config.environment === 'production' ? [] : [startFoundationQueue(db, config.queue, timings.foundation, timings.pollMs)];
  return {
    async stop(waitMs?: number): Promise<void> {
      stopCleanup();
      await Promise.all(queues.map(queue => queue.stop(waitMs)));
    },
  };
}
