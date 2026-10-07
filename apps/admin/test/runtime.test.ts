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
  const upstream = createHttpServer((request, response) => {
    upstreamCalls++;
    response.setHeader('Content-Type', 'application/json');
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
    available = false;
    assert.deepEqual(await checkDevelopmentConnection('ready', fetcher), { kind: 'database-unavailable', target: 'ready' });
    assert.deepEqual(await checkDevelopmentConnection('live', fetcher), { kind: 'connected', target: 'live' });
    const product = await fetch(new URL('/api/v1/admin/test?synthetic=1', origin), { headers: { Origin: new URL(origin).origin, Cookie: 'synthetic=1' } });
    assert.deepEqual(await product.json(), { path: '/api/v1/admin/test?synthetic=1', origin: new URL(origin).origin, cookie: 'synthetic=1' });
    const count = upstreamCalls;
    await fetch(new URL('/internal/health/ready/extra', origin));
    await fetch(new URL('/api/v10/extra', origin));
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
  const names = ['ADMIN_DEV_API_ORIGIN', 'DATABASE_URL', 'SERVER_SECRET', 'VITE_SYNTHETIC_SECRET', 'NODE_ENV'];
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
    assert.ok(output.every(text => !text.includes(marker) && !text.includes('/internal/health/') && !text.includes('database-unavailable')));
    assert.equal(config.server?.proxy, undefined);
    assert.equal(configuration({ command: 'serve', mode: 'production', isPreview: true }).server?.proxy, undefined);
    // Override any developer's ignored .env file for this failure check.
    process.env.ADMIN_DEV_API_ORIGIN = '';
    assert.throws(() => configuration({ command: 'serve', mode: 'development' }), /ADMIN_DEV_API_ORIGIN/);
  } finally {
    await rm(directory, { recursive: true });
    names.forEach((name, index) => { const value = previous[index]; if (value === undefined) delete process.env[name]; else process.env[name] = value; });
  }
});
