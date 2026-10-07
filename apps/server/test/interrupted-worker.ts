import { createDatabase } from '../src/database/pool.js';
import { createQueue, recordEffect } from '../src/jobs/foundation.js';
import { integrationConfiguration } from './helpers.js';

// Test-only worker fixture: pause after commit so the parent can kill an active process.
const config = integrationConfiguration();
const pool = createDatabase(config);
const boss = createQueue(config);
const queue = process.env.FOUNDATION_TEST_QUEUE;
if (!queue?.startsWith('foundation-')) throw new Error('Missing synthetic queue');
await boss.start();
await boss.createQueue(queue, { retryLimit: 3, retryDelay: 1, expireInSeconds: 3 });
await boss.work(queue, { pollingIntervalSeconds: 0.5 }, async jobs => {
  for (const job of jobs) {
    await recordEffect(pool, job.id);
    process.send?.(job.id);
    await new Promise<void>(() => { /* The parent terminates this active worker. */ });
  }
});
