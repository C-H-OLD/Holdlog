import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanupStartupFailure } from '../src/jobs/shutdown.js';

void test('startup cleanup always ends the pool and preserves the original error', async () => {
  for (const failStop of [false, true]) {
    for (const failEnd of [false, true]) {
      const original = new Error('synthetic startup failure');
      const calls: string[] = [];
      const boss = { stop: () => { calls.push('stop'); return failStop ? Promise.reject(new Error('synthetic stop failure')) : Promise.resolve(); } };
      const pool = { end: () => { calls.push('end'); return failEnd ? Promise.reject(new Error('synthetic end failure')) : Promise.resolve(); } };
      await assert.rejects(cleanupStartupFailure(boss, pool, original), error => error === original);
      assert.deepEqual(calls, ['stop', 'end']);
    }
  }
});
