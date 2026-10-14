import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateKeyPair, SignJWT, createLocalJWKSet, exportJWK, type JWTPayload } from 'jose';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { ProviderVerifier } from '../src/modules/identity/providers.js';
import { hashSecret } from '../src/modules/identity/identity.repository.js';
import type { LoginInput } from '../src/modules/identity/identity.service.js';

void test('provider JWT checks require signature, issuer, audience, exp, subject and provider-specific nonce', async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const nonce = randomUUID(), hash = hashSecret(nonce), jwk = await exportJWK(publicKey);
  const resolver = createLocalJWKSet({ keys: [{ ...jwk, kid: 'fixture', alg: 'RS256' }] });
  const config = { google: { audiences: ['fixture-google'], issuers: ['https://accounts.google.com'], jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs' }, apple: { audiences: ['fixture-apple'], issuer: 'https://appleid.apple.com', jwksUrl: 'https://appleid.apple.com/auth/keys', teamId: 'SYNTHETIC1', keyId: 'SYNTHETIC2', privateKey: generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey } };
  const verifier = new ProviderVerifier(config, { google: resolver, apple: resolver });
  /** Sign synthetic provider claims with an ephemeral key; never persist signed JWTs in fixtures/logs. */
  async function token(claims: JWTPayload): Promise<string> { return new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'fixture' }).sign(privateKey); }
  const claims = { iss: 'https://accounts.google.com', aud: 'fixture-google', sub: 'fixture-subject', exp: Math.floor(Date.now() / 1000) + 300, nonce, email: 'synthetic@example.invalid', email_verified: true };
  const input: LoginInput = { provider: 'google', idToken: await token(claims), authorizationCode: null, deviceId: randomUUID(), challengeId: randomUUID() };
  assert.deepEqual(await verifier.verify(input, hash), { provider: 'google', subject: claims.sub, email: claims.email });
  for (const override of [{ iss: 'https://attacker.invalid' }, { aud: 'wrong-client' }, { exp: 1 }, { exp: undefined }, { nonce: 'wrong-nonce' }, { nonce: undefined }, { sub: '' }, { sub: undefined }]) {
    await assert.rejects(verifier.verify({ ...input, idToken: await token(JSON.parse(JSON.stringify({ ...claims, ...override })) as JWTPayload) }, hash), { code: 'UNAUTHENTICATED' });
  }
  const { privateKey: attacker } = await generateKeyPair('RS256');
  const forged = await new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'fixture' }).sign(attacker);
  await assert.rejects(verifier.verify({ ...input, idToken: forged }, hash), { code: 'UNAUTHENTICATED' });
  assert.equal((await verifier.verify({ ...input, idToken: await token({ ...claims, email_verified: false }) }, hash)).email, null);
  const apple = { ...claims, iss: config.apple.issuer, aud: 'fixture-apple', nonce: hash };
  assert.equal((await verifier.verify({ ...input, provider: 'apple', idToken: await token(apple) }, hash)).provider, 'apple');
  await assert.rejects(verifier.verify({ ...input, provider: 'apple', idToken: await token({ ...apple, nonce }) }, hash), { code: 'UNAUTHENTICATED' });
});

void test('generated HTTP adapter accepts bodyless challenge, rejects missing key and unknown signup fields', async () => {
  const { validateInput } = await import('../src/modules/identity/identity.controller.js');
  const headers = { 'idempotency-key': randomUUID() };
  assert.doesNotThrow(() => validateInput('createLoginChallenge', undefined, headers));
  assert.throws(() => validateInput('createLoginChallenge', undefined, {}), { code: 'INVALID_INPUT' });
  assert.throws(() => validateInput('completeSignup', { signupToken: 'fixture', name: 'name', deviceId: randomUUID(), extra: true }, headers), { code: 'INVALID_INPUT' });
});

void test('Apple code exchange uses the verified audience, verifies returned subject/nonce, and fails safely on outage', async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey), nonceHash = hashSecret('fixture-nonce');
  const resolver = createLocalJWKSet({ keys: [{ ...jwk, kid: 'fixture' }] });
  const config = { google: { audiences: ['google-client'], issuers: ['https://accounts.google.com'], jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs' }, apple: { audiences: ['apple-client'], issuer: 'https://appleid.apple.com', jwksUrl: 'https://appleid.apple.com/auth/keys', teamId: 'SYNTHETIC1', keyId: 'SYNTHETIC2', privateKey: generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey } };
  /** Sign the original and exchanged synthetic Apple identity with controlled subject/nonce. */
  async function token(subject: string, nonce = nonceHash) { return new SignJWT({ nonce }).setProtectedHeader({ alg: 'RS256', kid: 'fixture' }).setIssuer(config.apple.issuer).setAudience('apple-client').setSubject(subject).setExpirationTime('5m').sign(privateKey); }
  const input: LoginInput = { provider: 'apple', idToken: await token('same-subject'), authorizationCode: 'synthetic-code', deviceId: randomUUID(), challengeId: randomUUID() };
  let exchanged = await token('same-subject'), status = 200, calls = 0;
  const fetcher: typeof fetch = (url, init) => {
    calls++; assert.equal(url, 'https://appleid.apple.com/auth/token'); assert.equal(init?.redirect, 'error'); assert.ok(init?.signal);
    const form = init?.body as URLSearchParams;
    assert.equal(form.get('client_id'), 'apple-client'); assert.equal(form.get('code'), 'synthetic-code'); assert.ok(form.get('client_secret'));
    return Promise.resolve(new Response(JSON.stringify({ id_token: exchanged }), { status }));
  };
  const verifier = new ProviderVerifier(config, { google: resolver, apple: resolver }, fetcher);
  assert.equal((await verifier.verify(input, nonceHash)).subject, 'same-subject'); assert.equal(calls, 1);
  exchanged = await token('other-subject'); await assert.rejects(verifier.verify(input, nonceHash), { code: 'UNAUTHENTICATED' });
  exchanged = await token('same-subject', '0'.repeat(64)); await assert.rejects(verifier.verify(input, nonceHash), { code: 'UNAUTHENTICATED' });
  status = 503; await assert.rejects(verifier.verify(input, nonceHash), { code: 'TEMPORARY_FAILURE' });
  status = 400; await assert.rejects(verifier.verify(input, nonceHash), { code: 'UNAUTHENTICATED' });
  const timeout = new ProviderVerifier(config, { google: resolver, apple: resolver }, () => Promise.reject(new DOMException('timeout', 'TimeoutError')));
  await assert.rejects(timeout.verify(input, nonceHash), { code: 'TEMPORARY_FAILURE' });
});

void test('validation errors use JSON Pointer field paths', async () => {
  const { validateInput } = await import('../src/modules/identity/identity.controller.js');
  assert.throws(() => validateInput('completeSignup', { signupToken: 'fixture', deviceId: randomUUID() }, { 'idempotency-key': randomUUID() }), (error: unknown) => {
    assert.ok(error instanceof Error && 'fieldErrors' in error);
    assert.deepEqual(error.fieldErrors, [{ path: '/name', code: 'INVALID_INPUT' }]); return true;
  });
});

void test('remote JWKS rotates keys, ignores token jku URLs, and reports fetch failures/timeouts without raw details', async () => {
  const { createServer } = await import('node:http');
  const { createRemoteJWKSet } = await import('jose');
  const first = await generateKeyPair('RS256'), second = await generateKeyPair('RS256');
  let keys = [{ ...await exportJWK(first.publicKey), kid: 'first' }], status = 200, stalled = false, foreignRequests = 0;
  const server = createServer((request, response) => {
    if (request.url !== '/jwks') foreignRequests++;
    if (stalled) return;
    response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ keys }));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Expected TCP');
  const url = `http://127.0.0.1:${address.port}/jwks`;
  const resolver = createRemoteJWKSet(new URL(url), { cooldownDuration: 0, timeoutDuration: 50 });
  const config = { google: { audiences: ['client'], issuers: ['https://accounts.google.com'], jwksUrl: url }, apple: { audiences: ['apple'], issuer: 'https://appleid.apple.com', jwksUrl: url, teamId: 'SYNTHETIC1', keyId: 'SYNTHETIC2', privateKey: generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey } };
  const verifier = new ProviderVerifier(config, { google: resolver, apple: resolver });
  const nonce = randomUUID(), input: LoginInput = { provider: 'google', idToken: '', authorizationCode: null, deviceId: randomUUID(), challengeId: randomUUID() };
  /** Sign a synthetic rotating-key JWT with an untrusted jku that must never choose the trust source. */
  async function token(kid: string, key: Parameters<SignJWT['sign']>[0]) { return new SignJWT({ nonce }).setProtectedHeader({ alg: 'RS256', kid, jku: url.replace('/jwks', '/untrusted') }).setSubject('subject').setIssuer('https://accounts.google.com').setAudience('client').setExpirationTime('5m').sign(key); }
  try {
    input.idToken = await token('first', first.privateKey); assert.equal((await verifier.verify(input, hashSecret(nonce))).subject, 'subject');
    keys = [{ ...await exportJWK(second.publicKey), kid: 'second' }];
    input.idToken = await token('second', second.privateKey); assert.equal((await verifier.verify(input, hashSecret(nonce))).subject, 'subject');
    assert.equal(foreignRequests, 0);
    input.idToken = await token('missing', first.privateKey); status = 503;
    await assert.rejects(verifier.verify(input, hashSecret(nonce)), { code: 'TEMPORARY_FAILURE' });
    stalled = true;
    await assert.rejects(verifier.verify(input, hashSecret(nonce)), { code: 'TEMPORARY_FAILURE' });
  } finally { server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
