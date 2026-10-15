import { loadConfiguration } from './config/environment.js';
import { logEvent, reportStartupFailure } from './config/logging.js';
import { createDatabase } from './database/pool.js';
import { migrate } from './database/migrate.js';
import { registerApplicationWorkers } from './jobs/register.js';
import type { QueueRunner } from './jobs/runner.js';
import { cleanupStartupFailure } from './jobs/shutdown.js';

/** Start the separate application worker; initialize schema, redact failures and drain on signals. */
function main(): void {
  const config = loadConfiguration();
  const db = createDatabase(config);
  let workers: QueueRunner;
  try {
    migrate(db);
    workers = registerApplicationWorkers(db, config);
  } catch (error) { cleanupStartupFailure(db, error); }
  let stopping = false;
  /** Stop once: clear the cleanup timer, give active handlers 10 s, abort the rest, then close the DB. */
  const stop = async (): Promise<void> => {
    if (stopping) return;
    stopping = true;
    try { await workers.stop(10_000); }
    finally { db.close(); logEvent('worker.stopped'); }
  };
  process.once('SIGINT', () => { void stop().catch(error => reportStartupFailure(error, 'worker')); });
  process.once('SIGTERM', () => { void stop().catch(error => reportStartupFailure(error, 'worker')); });
  logEvent('worker.started');
}
try { main(); } catch (error) { reportStartupFailure(error, 'worker'); }
