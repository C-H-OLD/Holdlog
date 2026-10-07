import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import { test } from 'node:test';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { createQueue, recordEffect } from '../src/jobs/foundation.js';
import { integrationConfiguration } from './helpers.js';

void test('pg-boss retries after worker interruption without repeating the committed job effect', { timeout: 45000 }, async () => {
  const config = integrationConfiguration();
  const pool = createDatabase(config);
  const queue = 'foundation-' + randomUUID();
  const first = createQueue(config);
  const second = createQueue(config);
  let id: string | null = null;
  try {
    await migrate(pool);
    await first.start();
    await first.createQueue(queue, { retryLimit: 3, retryDelay: 1, expireInSeconds: 5 });
    const entered = Promise.withResolvers<void>();
    await first.work(queue, { pollingIntervalSeconds: 0.5 }, async jobs => {
      for (const job of jobs) {
        await recordEffect(pool, job.id);
        entered.resolve();
        // Keep the handler active until stop aborts it, modeling a crash after commit.
        await new Promise<void>(resolve => job.signal.addEventListener('abort', () => resolve(), { once: true }));
        throw new Error('synthetic interruption');
      }
    });
    id = await first.send(queue, {});
    assert.ok(id);
    await entered.promise;
    await first.stop({ graceful: false });
    await second.start();
    await second.work(queue, { pollingIntervalSeconds: 0.5 }, async jobs => {
      for (const job of jobs) await recordEffect(pool, job.id);
    });
    const deadline = Date.now() + 25000;
    let completed = false;
    while (Date.now() < deadline) {
      const jobs = await second.findJobs(queue, { id });
      if (jobs[0]?.state === 'completed') { completed = true; assert.ok(jobs[0].retryCount >= 1); break; }
      await setTimeout(200);
    }
    assert.ok(completed, 'interrupted job must complete after restart');
    assert.equal((await pool.query('SELECT job_id FROM holdlog_foundation.job_effects WHERE job_id=$1', [id])).rowCount, 1);
    await recordEffect(pool, id);
    assert.equal((await pool.query('SELECT job_id FROM holdlog_foundation.job_effects WHERE job_id=$1', [id])).rowCount, 1);
  } finally {
    await first.stop({ graceful: false });
    await second.deleteQueue(queue).catch(() => undefined);
    await second.stop({ graceful: false });
    if (id) await pool.query('DELETE FROM holdlog_foundation.job_effects WHERE job_id=$1', [id]);
    await pool.end();
  }
});

void test('SIGKILL after effect commit recovers the expired active job in a new worker', { timeout: 45000 }, async () => {
  const config = integrationConfiguration();
  const pool = createDatabase(config);
  const boss = createQueue(config);
  const queue = 'foundation-' + randomUUID();
  const child = fork(new URL('./interrupted-worker.js', import.meta.url), [], { env: { ...process.env, FOUNDATION_TEST_QUEUE: queue }, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  let id: string | null = null;
  try {
    await migrate(pool);
    await boss.start();
    await boss.createQueue(queue, { retryLimit: 3, retryDelay: 1, expireInSeconds: 3 });
    id = await boss.send(queue, {});
    assert.ok(id);
    const message = await once(child, 'message', { signal: AbortSignal.timeout(10000) });
    assert.equal(message[0], id);
    const exit = once(child, 'exit');
    child.kill('SIGKILL');
    const result = await exit;
    assert.equal(result[1], 'SIGKILL');
    await boss.work(queue, { pollingIntervalSeconds: 0.5 }, async jobs => { for (const job of jobs) await recordEffect(pool, job.id); });
    let completed = false;
    const deadline = Date.now() + 25000;
    while (Date.now() < deadline) {
      await boss.supervise(queue);
      const jobs = await boss.findJobs(queue, { id });
      if (jobs[0]?.state === 'completed') { completed = true; assert.ok(jobs[0].retryCount >= 1); break; }
      await setTimeout(200);
    }
    assert.ok(completed, 'abruptly interrupted job must recover');
    assert.equal((await pool.query('SELECT job_id FROM holdlog_foundation.job_effects WHERE job_id=$1', [id])).rowCount, 1);
  } finally {
    child.kill('SIGKILL');
    await boss.deleteQueue(queue).catch(() => undefined);
    await boss.stop({ graceful: false });
    if (id) await pool.query('DELETE FROM holdlog_foundation.job_effects WHERE job_id=$1', [id]);
    await pool.end();
  }
});
