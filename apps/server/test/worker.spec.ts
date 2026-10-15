import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanupStartupFailure } from '../src/jobs/shutdown.js';

void test('startup cleanup always closes the database and preserves the original error', () => {
  for (const failClose of [false, true]) {
    const original = new Error('synthetic startup failure');
    const calls: string[] = [];
    const db = { close: () => { calls.push('close'); if (failClose) throw new Error('synthetic close failure'); } };
    assert.throws(() => cleanupStartupFailure(db, original), error => error === original);
    assert.deepEqual(calls, ['close']);
  }
});
