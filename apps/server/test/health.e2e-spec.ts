import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApplication } from '../src/app.module.js';
import { integrationConfiguration } from './helpers.js';

void test('live200 and real DB ready200 follow the exact development contract', async () => {
  const app = await createApplication(integrationConfiguration());
  await app.listen(0, '127.0.0.1');
  try {
    const origin = await app.getUrl();
    const live = await fetch(origin + '/internal/health/live');
    assert.equal(live.status, 200); assert.deepEqual(await live.json(), { status: 'ok' });
    const ready = await fetch(origin + '/internal/health/ready');
    assert.equal(ready.status, 200); assert.deepEqual(await ready.json(), { status: 'ready' });
  } finally { await app.close(); }
});
void test('DB connection failure returns only ready503 and leaves live200', async () => {
  const config = integrationConfiguration();
  const broken = new URL(config.databaseUrl); broken.port = '1'; broken.password = 'synthetic-leak-marker';
  const app = await createApplication({ ...config, databaseUrl: broken.href });
  await app.listen(0, '127.0.0.1');
  try {
    const origin = await app.getUrl();
    const ready = await fetch(origin + '/internal/health/ready');
    assert.equal(ready.status, 503); assert.equal(await ready.text(), '{"status":"unavailable"}');
    assert.equal((await fetch(origin + '/internal/health/live')).status, 200);
  } finally { await app.close(); }
});
void test('production omits development routes and request logs omit headers and query', async () => {
  const config = integrationConfiguration();
  const lines: string[] = [];
  const original = console.info;
  console.info = (line: string) => { lines.push(line); };
  const app = await createApplication({ ...config, environment: 'production' });
  await app.listen(0, '127.0.0.1');
  try {
    const origin = await app.getUrl();
    for (const path of ['live', 'ready']) assert.equal((await fetch(origin + '/internal/health/' + path + '?secret=synthetic-leak-marker', { headers: { Authorization: 'Bearer synthetic-leak-marker', Cookie: 'secret=synthetic-leak-marker' } })).status, 404);
    assert.ok(lines.some(line => line.includes('request.finished')));
    assert.ok(lines.every(line => !line.includes('synthetic-leak-marker')));
  } finally { await app.close(); console.info = original; }
});
