import { createDatabase } from '../src/database/pool.js';
import { recordEffect } from '../src/jobs/foundation.js';
import { startQueue } from '../src/jobs/runner.js';

// Test-only worker fixture: claim the job, commit its effect, report the id and stay active until the parent kills it.
const [path, queue] = process.argv.slice(2);
if (!path || !queue?.startsWith('foundation-')) throw new Error('Missing synthetic queue');
const db = createDatabase({ databasePath: path });
startQueue(db, queue, { baseDelayMs: 50, maxAttempts: 4, leaseMs: 500 }, claimed => {
  recordEffect(db, claimed.id);
  process.send?.(claimed.id);
  return new Promise<void>(() => { /* The parent terminates this active worker. */ });
}, 20);
// Keep the process alive while the handler hangs; the parent ends it with SIGKILL.
setInterval(() => undefined, 1000);
