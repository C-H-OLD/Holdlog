import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateKeyPair, SignJWT, jwtVerify } from 'jose';
import { hash, verify, argon2id } from 'argon2';

void test('pinned JOSE runs ESM signing/verification and rejects a different audience on Node24', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const token = await new SignJWT({ nonce: 'synthetic-nonce' }).setProtectedHeader({ alg: 'RS256' }).setIssuer('https://synthetic.invalid').setAudience('synthetic-client').setSubject('synthetic-subject').setExpirationTime('2m').sign(privateKey);
  const result = await jwtVerify(token, publicKey, { algorithms: ['RS256'], issuer: 'https://synthetic.invalid', audience: 'synthetic-client' });
  assert.equal(result.payload.sub, 'synthetic-subject');
  await assert.rejects(jwtVerify(token, publicKey, { audience: 'wrong-client' }));
});

void test('pinned native Argon2id produces a PHC hash and rejects the previous password', async () => {
  const digest = await hash('synthetic-password-only', { type: argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });
  assert.match(digest, /^\$argon2id\$v=19\$/);
  assert.deepEqual(digest.split('$')[3]!.split(',').sort(), ['m=65536', 'p=4', 't=3']);
  assert.equal(await verify(digest, 'synthetic-password-only'), true);
  assert.equal(await verify(digest, 'synthetic-wrong-password'), false);
  assert.ok(!digest.includes('synthetic-password-only'));
});
