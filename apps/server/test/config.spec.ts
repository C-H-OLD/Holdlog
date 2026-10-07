import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadConfiguration } from '../src/config/environment.js';

/** Supply synthetic local configuration; never read developer secrets. */
export function testEnvironment(): NodeJS.ProcessEnv {
  return { NODE_ENV: 'test', API_HOST: '127.0.0.1', API_PORT: '3100', DATABASE_URL: 'postgresql://holdlog:synthetic@127.0.0.1:55433/holdlog_test', PRIVATE_STORAGE_PATH: '/tmp/holdlog-test-storage', ALLOWED_ORIGINS: 'http://localhost:5173', WORKER_QUEUE: 'foundation-check' };
}

void test('missing settings fail with names and never disclose values', () => {
  for (const key of Object.keys(testEnvironment())) {
    const env = testEnvironment();
    delete env[key];
    assert.throws(() => loadConfiguration(env), error => error instanceof Error && error.message.includes(key) && !error.message.includes('synthetic'));
  }
});
void test('invalid ports, public binds, remote databases and mixed environments are refused', () => {
  for (const patch of [{ API_PORT: '0' }, { API_PORT: '3100x' }, { API_HOST: '0.0.0.0' }, { DATABASE_URL: 'postgresql://holdlog:synthetic@example.com/holdlog_test' }, { DATABASE_URL: 'postgresql://holdlog:synthetic@localhost/holdlog_dev' }, { ALLOWED_ORIGINS: '*' }, { PRIVATE_STORAGE_PATH: 'relative' }, { NODE_ENV: 'unknown' }, { WORKER_QUEUE: 'bad queue' }]) {
    assert.throws(() => loadConfiguration({ ...testEnvironment(), ...patch }));
  }
});
void test('valid configuration distinguishes test from development without logging secrets', () => {
  assert.equal(loadConfiguration(testEnvironment()).environment, 'test');
  assert.equal(loadConfiguration({ ...testEnvironment(), NODE_ENV: 'development', DATABASE_URL: 'postgresql://holdlog:synthetic@localhost/holdlog_dev' }).environment, 'development');
});
