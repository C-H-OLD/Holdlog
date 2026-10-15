import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { normalizeUuid } from '../src/modules/identity/identity.repository.js';
import { SignupRequestLocks, signupRequestKey } from '../src/modules/identity/signup-request-locks.js';

void test('signup entry locks are nonblocking per normalized proof/key and free again after release', () => {
  const locks = new SignupRequestLocks(), proofId = randomUUID(), key = randomUUID();
  const entry = signupRequestKey(proofId, key);
  assert.equal(locks.tryAcquire(entry), true);
  assert.equal(locks.tryAcquire(entry), false);
  assert.equal(locks.tryAcquire(signupRequestKey(proofId.toUpperCase(), 'urn:uuid:' + key.toUpperCase())), false);
  assert.equal(locks.tryAcquire(signupRequestKey(proofId, randomUUID())), true);
  locks.release(entry);
  assert.equal(locks.tryAcquire(entry), true);
});

void test('client UUIDs normalize to lowercase without the urn:uuid: prefix', () => {
  const id = randomUUID();
  assert.equal(normalizeUuid(id.toUpperCase()), id);
  assert.equal(normalizeUuid('URN:UUID:' + id.toUpperCase()), id);
  assert.equal(normalizeUuid(id), id);
});
