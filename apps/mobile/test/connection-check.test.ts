import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { checkDevelopmentConnection } from '../src/development/connection-check.ts';

void test('uses explicit platform host and exact foundation responses', async () => {
  for (const origin of ['http://127.0.0.1:3100', 'http://10.0.2.2:3100']) {
    const fetcher: typeof fetch = (input, init) => {
      assert.equal(input, origin + '/internal/health/ready');
      assert.equal(init?.credentials, 'omit');
      assert.deepEqual(init?.headers, { 'Cache-Control': 'no-cache' });
      assert.ok(init?.signal);
      return Promise.resolve(new Response('{"status":"ready"}', { status: 200 }));
    };
    assert.deepEqual(await checkDevelopmentConnection(origin, 'ready', fetcher), { kind: 'connected', target: 'ready' });
  }
});
void test('distinguishes unavailable DB, network failure, and malformed responses', async () => {
  const origin = 'http://10.0.2.2:3100';
  assert.deepEqual(await checkDevelopmentConnection(origin, 'ready', () => Promise.resolve(new Response('{"status":"unavailable"}', { status: 503 }))), { kind: 'database-unavailable', target: 'ready' });
  assert.deepEqual(await checkDevelopmentConnection(origin, 'live', () => Promise.resolve(new Response('{"status":"ok"}'))), { kind: 'connected', target: 'live' });
  assert.deepEqual(await checkDevelopmentConnection(origin, 'ready', () => Promise.reject(new Error('synthetic-secret'))), { kind: 'connection-failed', target: 'ready' });
  for (const [body, status] of [['invalid', 200], ['{"status":"ready","secret":"synthetic"}', 200], ['{"status":"ready"}', 503]] as const) {
    assert.deepEqual(await checkDevelopmentConnection(origin, 'ready', () => Promise.resolve(new Response(body, { status }))), { kind: 'invalid-response', target: 'ready', httpStatus: status });
  }
});

void test('deadline aborts an actual HTTP response whose body never arrives', async () => {
  const server = createServer((_request, response) => { response.writeHead(200, { 'Content-Type': 'application/json' }); response.flushHeaders(); });
  try {
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const address = server.address(); assert.ok(address && typeof address !== 'string');
    assert.deepEqual(await checkDevelopmentConnection('http://127.0.0.1:' + address.port), { kind: 'connection-failed', target: 'ready' });
  } finally {
    server.closeAllConnections();
    if (server.listening) { const closing = once(server, 'close'); server.close(); await closing; }
  }
});
