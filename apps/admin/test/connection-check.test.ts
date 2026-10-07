import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkDevelopmentConnection } from '../src/development/connection-check.ts';

void test('relative health requests accept only exact live200 and ready200 responses', async () => {
  for (const target of ['live', 'ready'] as const) {
    let path: Parameters<typeof fetch>[0] | undefined;
    const result = await checkDevelopmentConnection(target, input => {
      path = input;
      return Promise.resolve(new Response(JSON.stringify({ status: target === 'live' ? 'ok' : 'ready' }), { status: 200 }));
    });
    assert.equal(path, '/internal/health/' + target);
    assert.deepEqual(result, { kind: 'connected', target });
  }
});
void test('DB503 is distinct from fetch rejection and proxy502', async () => {
  assert.deepEqual(await checkDevelopmentConnection('ready', () => Promise.resolve(new Response('{"status":"unavailable"}', { status: 503 }))), { kind: 'database-unavailable', target: 'ready' });
  assert.deepEqual(await checkDevelopmentConnection('ready', () => Promise.reject(new Error('synthetic-network-detail'))), { kind: 'connection-failed', target: 'ready' });
  assert.deepEqual(await checkDevelopmentConnection('ready', () => Promise.resolve(new Response('', { status: 502 }))), { kind: 'connection-failed', target: 'ready' });
});
void test('unexpected status/body, invalid JSON and extra fields are invalid responses', async () => {
  for (const [status, body] of [[200, '{"status":"unavailable"}'], [503, '{"status":"ready"}'], [200, 'not-json'], [200, '{"status":"ready","detail":"synthetic-secret"}'], [404, '{}']] as const) {
    assert.deepEqual(await checkDevelopmentConnection('ready', () => Promise.resolve(new Response(body, { status }))), { kind: 'invalid-response', target: 'ready', httpStatus: status });
  }
  assert.deepEqual(await checkDevelopmentConnection('live', () => Promise.resolve(new Response('{"status":"unavailable"}', { status: 503 }))), { kind: 'invalid-response', target: 'live', httpStatus: 503 });
});
void test('health calls use same-origin credentials and a bounded request signal', async () => {
  await checkDevelopmentConnection('ready', (_input, init) => {
    assert.equal(init?.credentials, 'same-origin');
    assert.equal(init?.cache, 'no-store');
    assert.ok(init?.signal instanceof AbortSignal);
    return Promise.resolve(new Response('{"status":"ready"}'));
  });
});
