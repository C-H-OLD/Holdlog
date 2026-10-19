import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSignupFlow } from '../src/lib/signupFlow.ts';
import { deviceId, now } from './identity-fixtures.ts';

/** Bind a memory-only proof to one authentication generation. */
function setup() {
  let clock = now; let keys = 0;
  const flow = createSignupFlow({ now: () => clock, newRequestKey: () => `request-${++keys}` });
  flow.begin({ signupToken: 'proof-secret', expiresAt: '2026-10-19T00:15:00Z' }, 2);
  return { flow, expire: () => { clock += 16 * 60_000; } };
}
void test('proof remains private, blank names are blocked and unchanged retries share a key', () => {
  const { flow } = setup();
  assert.doesNotMatch(JSON.stringify(flow.snapshot()), /proof-secret|signupToken/);
  assert.throws(() => flow.prepare(deviceId, 2), { kind: 'input' });
  flow.setName('  Climber  '); const first = flow.prepare(deviceId, 2);
  assert.equal(first.input.name, 'Climber'); assert.equal(first.input.signupToken, 'proof-secret');
  assert.throws(() => flow.prepare(deviceId, 2), { kind: 'unavailable' });
  flow.settle(); assert.equal(flow.prepare(deviceId, 2).key, first.key);
  flow.settle(); flow.setName('Someone'); assert.notEqual(flow.prepare(deviceId, 2).key, first.key);
});
void test('cancelled or denied photo selection preserves name; expiry and account boundaries discard draft', () => {
  const { flow, expire } = setup(); flow.setName('Climber');
  flow.selectPhoto({ kind: 'selected', uri: 'file:///private-photo' });
  flow.selectPhoto({ kind: 'cancelled' }); flow.selectPhoto({ kind: 'denied' });
  assert.deepEqual(flow.snapshot(), { name: 'Climber', hasPhoto: true, busy: false });
  assert.doesNotMatch(JSON.stringify(flow.snapshot()), /private-photo/);
  assert.throws(() => flow.prepare(deviceId, 3), { kind: 'stale' });
  expire(); assert.throws(() => flow.prepare(deviceId, 2), { kind: 'reauthenticate' });
  assert.deepEqual(flow.snapshot(), { name: '', hasPhoto: false, busy: false });
  flow.begin({ signupToken: 'new-proof', expiresAt: '2026-10-19T01:00:00Z' }, 4);
  assert.equal(flow.snapshot().name, '');
});
