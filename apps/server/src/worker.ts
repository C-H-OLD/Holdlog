import { loadConfiguration } from './config/environment.js';
import { logEvent, reportStartupFailure } from './config/logging.js';
import { createDatabase } from './database/pool.js';
import { migrate } from './database/migrate.js';
import { createQueue, registerWorker } from './jobs/foundation.js';
import { cleanupStartupFailure } from './jobs/shutdown.js';

/** Start the separate local worker; initialize schema, redact failures and drain on signals. */
async function main(): Promise<void> {
  const config = loadConfiguration();
  if (config.environment === 'production') throw new Error('Foundation worker is development-only');
  const pool = createDatabase(config);
  const boss = createQueue(config);
  try {
    await migrate(pool);
    await boss.start();
    await registerWorker(boss, pool, config.queue);
  } catch (error) { await cleanupStartupFailure(boss, pool, error); }
  let stopping = false;
  /** Stop once, allowing active effects to finish before ending DB connections. */
  const stop = async (): Promise<void> => {
    if (stopping) return;
    stopping = true;
    try { await boss.stop({ graceful: true, timeout: 10000 }); }
    finally { await pool.end(); logEvent('worker.stopped'); }
  };
  process.once('SIGINT', () => { void stop().catch(error => reportStartupFailure(error, 'worker')); });
  process.once('SIGTERM', () => { void stop().catch(error => reportStartupFailure(error, 'worker')); });
  logEvent('worker.started');
}
await main().catch(error => reportStartupFailure(error, 'worker'));
