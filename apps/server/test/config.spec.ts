import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfiguration } from '../src/config/environment.js';
import { reportStartupFailure } from '../src/config/logging.js';

void test('startup reporting emits identity setting names or a fixed failure category without secret material', () => {
  const errors: string[] = [], info: string[] = [];
  const originalError = console.error, originalInfo = console.info, exitCode = process.exitCode;
  console.error = (message: string) => { errors.push(message); };
  console.info = (message: string) => { info.push(message); };
  try {
    reportStartupFailure(new Error('Missing or invalid settings: ADMIN_CSRF_KEY, APPLE_PRIVATE_KEY_PATH'), 'api');
    reportStartupFailure(new Error('synthetic-private-token-and-password'), 'api');
    assert.deepEqual(errors, ['Missing or invalid settings: ADMIN_CSRF_KEY, APPLE_PRIVATE_KEY_PATH']);
    assert.deepEqual(info, ['{"event":"api.failed"}']);
  } finally { console.error = originalError; console.info = originalInfo; process.exitCode = exitCode; }
});

void test('admin preparation can validate its own secrets without Google/Apple developer settings', async () => {
  const module = await import('../src/config/environment.js');
  assert.ok('loadAdminIdentityConfiguration' in module, 'Separate admin configuration is missing');
  const loadAdmin = module.loadAdminIdentityConfiguration as (env: NodeJS.ProcessEnv) => { allowedOrigins: string[] };
  assert.deepEqual(loadAdmin({ ADMIN_CSRF_KEY: Buffer.alloc(32, 8).toString('base64'), ADMIN_ALLOWED_ORIGINS: 'https://localhost:5173' }).allowedOrigins, ['https://localhost:5173']);
});

void test('identity settings have a separate strict loader; foundation health does not require provider secrets', async () => {
  const module = await import('../src/config/environment.js');
  assert.ok('loadIdentityConfiguration' in module, 'Identity settings loader is missing');
});

void test('identity settings reject missing secrets, unsafe origins and wrong Apple keys without printing values', async () => {
  const module = await import('../src/config/environment.js');
  assert.ok('loadIdentityConfiguration' in module, 'Identity settings loader is missing');
  const loadIdentity = module.loadIdentityConfiguration as (env: NodeJS.ProcessEnv) => unknown;
  const directory = mkdtempSync(join(tmpdir(), 'holdlog-identity-key-'));
  const keyPath = join(directory, 'synthetic.p8');
  const privateKey = generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey;
  writeFileSync(keyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  const env = { GOOGLE_CLIENT_IDS: 'synthetic.apps.googleusercontent.com', APPLE_CLIENT_IDS: 'com.holdlog.development', APPLE_TEAM_ID: 'SYNTH00001', APPLE_KEY_ID: 'SYNTH00002', APPLE_PRIVATE_KEY_PATH: keyPath, ADMIN_CSRF_KEY: Buffer.alloc(32, 7).toString('base64'), ADMIN_ALLOWED_ORIGINS: 'https://localhost:5173' };
  try {
    assert.doesNotThrow(() => loadIdentity(env));
    for (const name of Object.keys(env)) {
      const copy: NodeJS.ProcessEnv = { ...env }; delete copy[name];
      assert.throws(() => loadIdentity(copy), error => error instanceof Error && error.message.includes(name) && !error.message.includes(directory));
    }
    for (const patch of [{ ADMIN_ALLOWED_ORIGINS: 'http://localhost:5173' }, { ADMIN_ALLOWED_ORIGINS: 'https://localhost:5173/path' }, { ADMIN_ALLOWED_ORIGINS: 'https://user:synthetic-secret@localhost' }, { GOOGLE_CLIENT_IDS: 'synthetic,,' }, { APPLE_TEAM_ID: 'bad' }, { ADMIN_CSRF_KEY: 'synthetic-secret' }, { APPLE_PRIVATE_KEY_PATH: '/missing/synthetic-secret' }]) {
      assert.throws(() => loadIdentity({ ...env, ...patch }), error => error instanceof Error && !error.message.includes('synthetic-secret'));
    }
    const rsaKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
    writeFileSync(keyPath, rsaKey.export({ type: 'pkcs8', format: 'pem' }));
    assert.throws(() => loadIdentity(env), /APPLE_PRIVATE_KEY_PATH/);
    assert.equal(loadConfiguration(testEnvironment()).environment, 'test');
  } finally { rmSync(directory, { recursive: true }); }
});

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
