import { loadConfiguration } from '../config/environment.js';
import { logEvent, reportStartupFailure } from '../config/logging.js';
import { createDatabase } from './pool.js';
import { migrate } from './migrate.js';

/** Apply local migrations, close the pool on either outcome and redact startup errors. */
async function main(): Promise<void> {
  const config = loadConfiguration();
  const pool = createDatabase(config);
  try { await migrate(pool); logEvent('migration.completed'); }
  finally { await pool.end(); }
}
await main().catch(error => reportStartupFailure(error, 'migration'));
