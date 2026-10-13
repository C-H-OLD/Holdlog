import assert from 'node:assert/strict';
import { test } from 'node:test';
import type pg from 'pg';
import { withTransaction } from '../src/database/transaction.js';

void test('a rollback failure discards the client and preserves the original transaction failure', async () => {
  const failure = new Error('synthetic transaction failure');
  let released: Error | boolean | undefined;
  const calls: string[] = [];
  const client = {
    query: (sql: string) => { calls.push(sql); return sql === 'ROLLBACK' ? Promise.reject(new Error('synthetic rollback failure')) : Promise.resolve({ rows: [] }); },
    release: (error?: Error | boolean) => { released = error; },
  } as unknown as pg.PoolClient;
  const pool = { connect: () => Promise.resolve(client) } as unknown as pg.Pool;
  await assert.rejects(withTransaction(pool, () => Promise.reject(failure)), error => error === failure);
  assert.deepEqual(calls, ['BEGIN ISOLATION LEVEL READ COMMITTED', 'ROLLBACK']);
  assert.equal(released, true);
});
