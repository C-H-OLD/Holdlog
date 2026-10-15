import { fork } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import type Database from 'better-sqlite3';
import { loadConfiguration, type Configuration } from '../src/config/environment.js';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';

/**
 * Validate synthetic test settings for holdlog_test.sqlite in the given folder (a new temporary folder by default).
 * Every test owns its DB file, so there is no shared test DB and no cleanup DELETE.
 */
export function integrationConfiguration(directory = mkdtempSync(join(tmpdir(), 'holdlog-test-'))): Configuration {
  return loadConfiguration({ NODE_ENV: 'test', API_HOST: '127.0.0.1', API_PORT: '3100', DATABASE_PATH: join(directory, 'holdlog_test.sqlite'), PRIVATE_STORAGE_PATH: '/tmp/holdlog-test-storage', ALLOWED_ORIGINS: 'http://localhost:5173', WORKER_QUEUE: 'foundation-check' });
}

export interface TestDatabase { config: Configuration; db: Database.Database; close: () => void }

/** Open a fresh test DB file, migrated unless migrated=false; close() closes this connection and removes the folder. */
export function testDatabase(migrated = true): TestDatabase {
  const directory = mkdtempSync(join(tmpdir(), 'holdlog-test-'));
  const config = integrationConfiguration(directory);
  const db = createDatabase(config);
  if (migrated) migrate(db);
  return { config, db, close: () => { if (db.open) db.close(); rmSync(directory, { recursive: true, force: true }); } };
}

/** Block this thread for ms, so SQLite 'now' moves past a boundary between statements of one transaction. */
export function sleepSync(ms: number): void { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

/**
 * Register test-only SQL functions on one connection for TEMP failure-injection triggers:
 * test_once(name) returns 1 only on the first call per name; test_sleep(ms) blocks and returns 0.
 * TEMP triggers and these functions exist only on that connection and disappear when it closes.
 */
export function registerTestFunctions(db: Database.Database): void {
  const seen = new Set<string>();
  db.function('test_once', (name: unknown) => {
    const key = typeof name === 'string' ? name : '';
    if (seen.has(key)) return 0;
    seen.add(key);
    return 1;
  });
  db.function('test_sleep', (ms: unknown) => { sleepSync(Number(ms)); return 0; });
}

/** Return the UTC ISO time ms from now (negative for the past) in the stored format. */
export function isoFromNow(ms: number): string { return new Date(Date.now() + ms).toISOString(); }

/** Poll predicate every 10 ms until it is true or timeoutMs passes; returns the last result. */
export async function waitFor(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) return false;
    await delay(10);
  }
  return true;
}

/**
 * Fork a child that opens the same DB file, takes the write lock (BEGIN IMMEDIATE), reports it, waits holdMs,
 * runs sql and commits. Resolves once the lock is held; await exited before asserting the committed effect.
 * A separate process is required: a second connection in this process would block the event loop while waiting.
 */
export async function holdDatabase(path: string, holdMs: number, sql = ''): Promise<{ exited: Promise<unknown[]> }> {
  const child = fork(new URL('./hold-database.js', import.meta.url), [path, String(holdMs), sql], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
  const exited = once(child, 'exit');
  await once(child, 'message', { signal: AbortSignal.timeout(10_000) });
  return { exited };
}
