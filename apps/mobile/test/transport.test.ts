import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMobileIdentityApi, isMobileSession } from '../src/api/holdlog/auth.ts';
import { createMobileProfileApi } from '../src/api/holdlog/profile.ts';
import { MobileIdentityError } from '../src/api/holdlog/client.ts';

const key = '123e4567-e89b-42d3-a456-426614174000';
const origin = 'https://api.example.test';
const profile = { id: key, name: 'Fixture', photoFileId: null, version: 2, identity: { provider: 'google' as const, email: null } };
const session = { accessToken: 'access-secret', refreshToken: 'refresh-secret', accessExpiresAt: '2026-10-19T10:00:00Z', refreshExpiresAt: '2026-11-19T10:00:00Z', profile };
const input = { provider: 'google' as const, idToken: 'provider-secret', challengeId: key, deviceId: key, authorizationCode: null };
const signup = { signupToken: 'signup-secret', name: 'Fixture', deviceId: key };
const challenge = { challengeId: key, nonce: 'nonce-fixture', expiresAt: '2026-10-19T10:00:00Z' };
/** Build synthetic HTTP responses without contacting an external identity provider. */
function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } }); }
/** Check only safe errors: no wire bodies, submitted credentials, causes or raw exception messages survive. */
function failure(kind: MobileIdentityError['kind'], status: number | null = null, code: MobileIdentityError['code'] = null) {
  return (error: unknown): boolean => {
    assert.ok(error instanceof MobileIdentityError);
    assert.equal(error.kind, kind); assert.equal(error.status, status); assert.equal(error.code, code);
    assert.equal('cause' in error, false);
    assert.doesNotMatch(JSON.stringify(error) + String(error) + error.stack, /provider-secret|signup-secret|refresh-secret|server-secret|access-secret/);
    return true;
  };
}

void test('all seven generated operations use exact v2 methods, keys and isolated credentials', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const responses = [json(challenge), json({ kind: 'authenticated', session }), json(session, 201), json(session), json({}), json(profile, 200, { ETag: '"2"' }), json(profile, 200, { ETag: '"2"' })];
  const fetcher: typeof fetch = (url, init) => { calls.push({ url: typeof url === 'string' ? url : url instanceof URL ? url.href : url.url, init: init ?? {} }); return Promise.resolve(responses.shift()!); };
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: fetcher });
  const profiles = createMobileProfileApi({ baseUrl: origin, fetch: fetcher });
  assert.deepEqual(await api.challenge(key), challenge);
  assert.deepEqual(await api.login(input, key), { kind: 'authenticated', session });
  assert.deepEqual(await api.signup(signup, key), session);
  assert.deepEqual(await api.refresh({ refreshToken: 'refresh-secret', deviceId: key }, key), session);
  assert.equal(await api.logout('access-secret', key), undefined);
  assert.deepEqual(await profiles.get('access-secret'), profile);
  assert.deepEqual(await profiles.edit({ name: 'Fixture' }, { accessToken: 'access-secret', key, version: 1 }), profile);
  const paths = ['/auth/challenges', '/auth/sessions', '/auth/signups', '/auth/sessions/refresh', '/auth/sessions/current', '/me', '/me'];
  const methods = ['POST', 'POST', 'POST', 'POST', 'DELETE', 'GET', 'PATCH'];
  calls.forEach(({ url, init }, i) => {
    assert.equal(url, origin + '/api/v2' + paths[i]); assert.equal(init.method, methods[i]);
    assert.equal(init.credentials, 'omit'); assert.equal(init.redirect, 'error');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('Authorization'), i >= 4 ? 'Bearer access-secret' : null);
    assert.equal(headers.get('Idempotency-Key'), i === 5 ? null : key);
    assert.equal(headers.get('If-Match'), i === 6 ? '"1"' : null);
    assert.equal(headers.get('Content-Type'), [1, 2, 3, 6].includes(i) ? 'application/json' : null);
    assert.equal(headers.get('Accept'), 'application/json');
    for (const name of ['Cookie', 'Origin', 'X-CSRF-Token']) assert.equal(headers.has(name), false);
  });
  assert.equal(calls[0]?.init.body, undefined); assert.equal(calls[4]?.init.body, undefined);
});

void test('login accepts both generated branches and rejects mixed, unknown and legacy session shapes', async () => {
  const proof = { signupToken: 'signup-secret', expiresAt: '2026-10-19T10:00:00Z' };
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(json({ kind: 'signup_required', signup: proof })) });
  assert.deepEqual(await api.login(input, key), { kind: 'signup_required', signup: proof });
  for (const body of [session, { kind: 'authenticated', session, signup: proof }, { kind: 'signup_required', session, signup: proof }, { kind: 'unknown', signup: proof }, { kind: 'authenticated', session: { ...session, profile: { ...profile, version: '2' } } }]) {
    const invalid = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(json(body)) });
    await assert.rejects(invalid.login(input, key), failure('contract', 200));
  }
  assert.equal(isMobileSession(session), true); assert.equal(isMobileSession({ ...session, refreshExpiresAt: 'tomorrow' }), false);
});

void test('invalid body, UUID keys, bearer and versions never reach fetch', async () => {
  let calls = 0;
  const options = { baseUrl: origin, fetch: () => { calls++; return Promise.resolve(json({})); } };
  const api = createMobileIdentityApi(options); const profiles = createMobileProfileApi(options);
  await assert.rejects(api.challenge('bad'), failure('input'));
  await assert.rejects(api.login({ ...input, deviceId: 'bad' }, key), failure('input'));
  await assert.rejects(api.login({ ...input, extra: true } as typeof input, key), failure('input'));
  await assert.rejects(api.signup({ ...signup, name: ' ' }, key), failure('input'));
  await assert.rejects(api.refresh({ refreshToken: 'refresh-secret', deviceId: 'bad' }, key), failure('input'));
  await assert.rejects(api.logout('access-secret\r\nCookie: secret', key), failure('input'));
  await assert.rejects(api.logout('access-secret', 'bad'), failure('input'));
  await assert.rejects(profiles.get(''), failure('input'));
  for (const version of [0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) await assert.rejects(profiles.edit({}, { accessToken: 'access-secret', key, version }), failure('input'));
  assert.equal(calls, 0);
});

void test('base URL and deadline configuration reject credentials, paths and invalid deadlines', () => {
  for (const baseUrl of ['relative', 'file:///tmp', 'https://user:secret@example.test', 'https://example.test/api/v2', 'https://example.test?secret', 'https://example.test#secret', 'https://example.test/x/..']) {
    assert.throws(() => createMobileIdentityApi({ baseUrl, fetch }), failure('input'));
  }
  for (const timeoutMs of [0, -1, Infinity, NaN, 120001]) assert.throws(() => createMobileIdentityApi({ baseUrl: origin, fetch, timeoutMs }), failure('input'));
});
void test('credentials require HTTPS except literal loopback and documented private development hosts', () => {
  for (const baseUrl of ['http://localhost:3100', 'http://127.0.0.1:3100', 'http://[::1]:3100', 'http://10.0.2.2:3100', 'http://192.168.1.5:3100', 'http://172.16.0.1', 'http://172.31.255.255', 'https://api.example.test', 'https://8.8.8.8']) {
    assert.doesNotThrow(() => createMobileIdentityApi({ baseUrl, fetch }));
  }
  for (const baseUrl of ['http://api.example.test', 'http://8.8.8.8', 'http://172.15.0.1', 'http://172.32.0.1', 'http://192.169.0.1', 'http://10.example.test', 'http://localhost.example.test', 'http://[2001:db8::1]', 'http://0.0.0.0', 'ftp://localhost']) {
    assert.throws(() => createMobileIdentityApi({ baseUrl, fetch }), failure('input'));
  }
});

void test('success status, body and profile version/ETag are validated exactly', async () => {
  for (const status of [200, 202, 204]) {
    const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(status === 204 ? new Response(null, { status }) : json(session, status)) });
    await assert.rejects(api.signup(signup, key), failure('contract', status));
  }
  for (const etag of [undefined, '2', 'W/"2"', '"3"']) {
    const profiles = createMobileProfileApi({ baseUrl: origin, fetch: () => Promise.resolve(json(profile, 200, etag === undefined ? {} : { ETag: etag })) });
    await assert.rejects(profiles.get('access-secret'), failure('contract', 200));
  }
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(new Response('server-secret', { status: 200 })) });
  await assert.rejects(api.challenge(key), failure('contract', 200));
  const badHeader = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(json(challenge, 200, { 'X-Request-Id': 'bad' })) });
  await assert.rejects(badHeader.challenge(key), failure('contract', 200));
});

void test('generated error validation preserves status and only safe public error metadata', async () => {
  const wire = { code: 'VERSION_CONFLICT', requestId: key, fieldErrors: [{ path: '/name', code: 'INVALID_INPUT' }, { path: '/server-secret', code: 'server-secret' }], currentVersion: 7, resourceId: null, retryable: false, blockingCrewIds: [], existingVisitId: null };
  const profiles = createMobileProfileApi({ baseUrl: origin, fetch: () => Promise.resolve(json(wire, 412)) });
  await assert.rejects(profiles.edit({ name: 'Fixture' }, { accessToken: 'access-secret', key, version: 1 }), error => {
    failure('http', 412, 'VERSION_CONFLICT')(error); assert.ok(error instanceof MobileIdentityError);
    assert.deepEqual(error.fieldErrors, [{ path: '/name', code: 'INVALID_INPUT' }]); assert.equal(error.currentVersion, 7); assert.equal(error.retryable, false); return true;
  });
  for (const status of [401, 403, 503]) {
    for (const response of [json({ secret: 'server-secret' }, status), new Response('server-secret', { status })]) {
      const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(response) });
      await assert.rejects(api.challenge(key), failure('contract', status));
    }
  }
});

void test('network failures do not retain raw credentials or retry automatically', async () => {
  let calls = 0;
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => { calls++; return Promise.reject(new Error('provider-secret')); } });
  await assert.rejects(api.login(input, key), failure('network')); assert.equal(calls, 1);
});

void test('caller cancellation and deadline settle even if injected fetch ignores abort', async () => {
  let calls = 0; let signal: AbortSignal | undefined;
  const fetcher: typeof fetch = (_url, init) => { calls++; signal = init?.signal ?? undefined; return new Promise(() => {}); };
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: fetcher, timeoutMs: 10 });
  const before = new AbortController(); before.abort('provider-secret');
  await assert.rejects(api.challenge(key, before.signal), failure('cancelled')); assert.equal(calls, 0);
  const controller = new AbortController(); const cancelled = api.challenge(key, controller.signal); controller.abort('provider-secret');
  await assert.rejects(cancelled, failure('cancelled')); assert.equal(signal?.aborted, true);
  await assert.rejects(api.challenge(key), failure('timeout')); assert.equal(signal?.aborted, true);
});

void test('deadline and cancellation cover body consumption as well as connection', async () => {
  const response = { status: 200, headers: new Headers(), json: () => new Promise<unknown>(() => {}) } as Response;
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => Promise.resolve(response), timeoutMs: 10 });
  await assert.rejects(api.challenge(key), failure('timeout'));
  const controller = new AbortController(); const pending = api.challenge(key, controller.signal);
  await Promise.resolve(); controller.abort(); await assert.rejects(pending, failure('cancelled'));
});

void test('input serialization failures are normalized without retaining a raw credential-bearing exception', async () => {
  let calls = 0;
  const api = createMobileIdentityApi({ baseUrl: origin, fetch: () => { calls++; return Promise.resolve(json({})); } });
  const body = Object.defineProperty({ ...input }, 'toJSON', { value: () => { throw new Error('provider-secret'); } });
  await assert.rejects(api.login(body, key), failure('input'));
  assert.equal(calls, 0);
});
