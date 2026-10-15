import { loadConfiguration } from '../config/environment.js';
import { logEvent, reportStartupFailure } from '../config/logging.js';
import { createDatabase } from './pool.js';
import { migrate } from './migrate.js';

/** Apply local migrations, close the connection on either outcome and redact startup errors. */
function main(): void {
  const config = loadConfiguration();
  const db = createDatabase(config);
  try { migrate(db); logEvent('migration.completed'); }
  finally { db.close(); }
}
try { main(); } catch (error) { reportStartupFailure(error, 'migration'); }
