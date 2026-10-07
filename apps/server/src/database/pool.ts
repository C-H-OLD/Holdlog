import pg from 'pg';
import type { Configuration } from '../config/environment.js';
import { logEvent } from '../config/logging.js';

/** Create a bounded local PostgreSQL pool. Callers must end it; connection errors are redacted. */
export function createDatabase(config: Configuration): pg.Pool {
  const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 5, connectionTimeoutMillis: 2000, idleTimeoutMillis: 1000, query_timeout: 2000 });
  pool.on('error', () => logEvent('database.failed'));
  return pool;
}
