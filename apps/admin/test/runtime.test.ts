import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { build, createServer, type ViteDevServer } from 'vite';
import configuration from '../vite.config.ts';
import { checkDevelopmentConnection } from '../src/development/connection-check.ts';

void test('real Vite serves React modules and proxies success503/network failure without rewriting Origin or cookies', async () => {
  let available = true;
  let upstreamCalls = 0;
  let healthHeaders: import('node:http').IncomingHttpHeaders = {};
  const upstream = createHttpServer((request, response) => {
    upstreamCalls++;
    response.setHeader('Content-Type', 'application/json');
    if (request.url?.startsWith('/internal/health/')) healthHeaders = request.headers;
    if (request.url === '/internal/health/ready') {
      response.statusCode = available ? 200 : 503;
      response.end(JSON.stringify({ status: available ? 'ready' : 'unavailable' }));
    } else if (request.url === '/internal/health/live') response.end('{"status":"ok"}');
    else response.end(JSON.stringify({ path: request.url, origin: request.headers.origin, cookie: request.headers.cookie }));
  });
  const previous = process.env.ADMIN_DEV_API_ORIGIN;
  const errors: string[] = [];
  const original = console.error;
  let vite: ViteDevServer | undefined;
  try {
    upstream.listen(0, '127.0.0.1'); await once(upstream, 'listening');
    const address = upstream.address(); assert.ok(address && typeof address !== 'string');
    process.env.ADMIN_DEV_API_ORIGIN = 'http://127.0.0.1:' + address.port;
    const config = configuration({ command: 'serve', mode: 'development', isPreview: false });
    vite = await createServer({ ...config, configFile: false, server: { ...config.server, port: 0, strictPort: false } });
    console.error = (...args: unknown[]) => { errors.push(args.map(String).join(' ')); };
    await vite.listen();
    const origin = vite.resolvedUrls?.local[0]; assert.ok(origin);
    const fetcher: typeof fetch = (input, init) => fetch(new URL(input instanceof Request ? input.url : input, origin), init);
    assert.match(await (await fetch(origin)).text(), /src\/main.tsx/);
    const module = await fetch(new URL('/src/main.tsx', origin));
    assert.equal(module.status, 200); assert.match(await module.text(), /createRoot/);
    assert.deepEqual(await checkDevelopmentConnection('ready', fetcher), { kind: 'connected', target: 'ready' });
    await fetch(new URL('/internal/health/ready', origin), { headers: { Cookie: 'synthetic=1', 'X-CSRF-Token': 'synthetic-csrf', Authorization: 'Bearer synthetic' } });
    assert.equal(healthHeaders.cookie, undefined);
    assert.equal(healthHeaders['x-csrf-token'], undefined);
    assert.equal(healthHeaders.authorization, undefined);
    available = false;
    assert.deepEqual(await checkDevelopmentConnection('ready', fetcher), { kind: 'database-unavailable', target: 'ready' });
    assert.deepEqual(await checkDevelopmentConnection('live', fetcher), { kind: 'connected', target: 'live' });
    const product = await fetch(new URL('/api/v2/admin/test?synthetic=1', origin), { headers: { Origin: new URL(origin).origin, Cookie: 'synthetic=1' } });
    assert.deepEqual(await product.json(), { path: '/api/v2/admin/test?synthetic=1', origin: new URL(origin).origin, cookie: 'synthetic=1' });
    assert.equal((await fetch(new URL('/__development/admin-auth', origin))).status,404);
    assert.equal((await fetch(new URL('/src/development/admin-auth-check.ts', origin))).status,404);
    const count = upstreamCalls;
    await fetch(new URL('/internal/health/ready/extra', origin));
    await fetch(new URL('/api/v10/extra', origin));
    await fetch(new URL('/api/v1/admin/test', origin));
    assert.equal(upstreamCalls, count);
    const close = once(upstream, 'close'); upstream.close(); await close;
    assert.deepEqual(await checkDevelopmentConnection('ready', fetcher), { kind: 'connection-failed', target: 'ready' });
    await fetch(new URL('/internal/health/ready?secret=synthetic-leak-marker', origin));
    assert.ok(errors.some(line => line.includes('Development API connection failed')));
    assert.ok(errors.every(line => !line.includes('synthetic-leak-marker')));
  } finally {
    console.error = original;
    // A rejected creation or shutdown must not leave an upstream handle or local environment behind.
    try { await vite?.close(); }
    finally {
      try { if (upstream.listening) { const close = once(upstream, 'close'); upstream.close(); await close; } }
      finally { if (previous === undefined) delete process.env.ADMIN_DEV_API_ORIGIN; else process.env.ADMIN_DEV_API_ORIGIN = previous; }
    }
  }
});

void test('production build works without proxy settings and excludes secrets and development health code', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'holdlog-admin-build-'));
  const names = ['ADMIN_DEV_API_ORIGIN', 'DATABASE_URL', 'SERVER_SECRET', 'VITE_SYNTHETIC_SECRET', 'ADMIN_CSRF_KEY', 'ADMIN_DEV_AUTH_CHECK', 'ADMIN_DEV_TLS_CERT', 'ADMIN_DEV_TLS_KEY', 'NODE_ENV'];
  const previous = names.map(name => process.env[name]);
  const marker = 'synthetic-bundle-secret-marker';
  delete process.env.ADMIN_DEV_API_ORIGIN;
  for (const name of names.slice(1, -1)) process.env[name] = marker;
  // Vite's prior development server sets NODE_ENV; build React's production variant explicitly.
  process.env.NODE_ENV = 'production';
  try {
    const config = configuration({ command: 'build', mode: 'production' });
    await build({ ...config, configFile: false, build: { ...config.build, outDir: directory, emptyOutDir: true } });
    const assets = await readdir(join(directory, 'assets'));
    const output = await Promise.all(assets.map(name => readFile(join(directory, 'assets', name), 'utf8')));
    assert.ok(output.length);
    assert.ok(output.every(text => !text.includes(marker) && !text.includes('/internal/health/') && !text.includes('database-unavailable') && !text.includes('admin-auth-check') && !text.includes('__development/admin-auth') && !text.includes('로그인 검사')));
    assert.equal(config.server?.proxy, undefined);
    assert.equal(configuration({ command: 'serve', mode: 'production', isPreview: true }).server?.proxy, undefined);
    // Override any developer's ignored .env file for this failure check.
    process.env.ADMIN_DEV_API_ORIGIN = '';
    for(const name of ['ADMIN_DEV_AUTH_CHECK','ADMIN_DEV_TLS_CERT','ADMIN_DEV_TLS_KEY'])delete process.env[name];
    assert.throws(() => configuration({ command: 'serve', mode: 'development' }), /ADMIN_DEV_API_ORIGIN/);
  } finally {
    await rm(directory, { recursive: true });
    names.forEach((name, index) => { const value = previous[index]; if (value === undefined) delete process.env[name]; else process.env[name] = value; });
  }
});

void test('ordinary HTTP LAN health mode rejects credential-bearing API requests before proxying', async () => {
  const names = ['ADMIN_DEV_API_ORIGIN', 'ADMIN_DEV_AUTH_CHECK', 'ADMIN_DEV_TLS_CERT', 'ADMIN_DEV_TLS_KEY'];
  const previous = names.map(name => process.env[name]);
  let vite: ViteDevServer | undefined;
  try {
    process.env.ADMIN_DEV_API_ORIGIN = 'http://192.168.1.5:3100';
    process.env.ADMIN_DEV_AUTH_CHECK = 'false';
    delete process.env.ADMIN_DEV_TLS_CERT; delete process.env.ADMIN_DEV_TLS_KEY;
    const config = configuration({ command: 'serve', mode: 'development', isPreview: false });
    assert.equal(config.server?.proxy?.['^/api/v2(?:/|$)'], undefined);
    assert.ok(config.server?.proxy?.['^/internal/health/(?:live|ready)(?:\\?|$)']);
    vite = await createServer({ ...config, configFile: false, server: { ...config.server, port: 0, strictPort: false } });
    await vite.listen();
    const origin = vite.resolvedUrls?.local[0]; assert.ok(origin);
    for (const path of ['/api/v2/admin/session', '/api/v2/admin/login', '/api/v2/admin/session?check=1']) {
      const response = await fetch(new URL(path, origin), { headers: { Cookie: 'synthetic=1', 'X-CSRF-Token': 'synthetic-csrf' } });
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.text();
      assert.ok(!body.includes('synthetic') && !body.includes('192.168'));
    }
  } finally {
    await vite?.close();
    names.forEach((name, index) => { if (previous[index] === undefined) delete process.env[name]; else process.env[name] = previous[index]; });
  }
});
