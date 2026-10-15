import { createDatabase } from '../src/database/pool.js';
import { sleepSync } from './helpers.js';

// Test-only fixture: hold the SQLite write lock in a separate process, then run the given SQL and commit.
const [path, holdMs, sql] = process.argv.slice(2);
if (!path || !holdMs) throw new Error('Missing hold arguments');
const db = createDatabase({ databasePath: path });
db.exec('BEGIN IMMEDIATE');
// Wait for the IPC write before blocking, so the parent learns that the lock is held.
process.send?.('held', undefined, {}, () => {
  sleepSync(Number(holdMs));
  if (sql) db.exec(sql);
  db.exec('COMMIT');
  db.close();
  process.disconnect?.();
});
