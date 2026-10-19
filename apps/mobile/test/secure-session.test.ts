/* eslint-disable @typescript-eslint/require-await -- Async fakes model the platform storage port without native imports. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionVault } from '../src/lib/secureSession.ts';
import { deferred, deviceId, session } from './identity-fixtures.ts';

/** A single-record fake models the platform keychain without native modules. */
function storage() {
  let value: string | null = null;
  return { read: async () => value, write: async (next: string) => { value = next; }, remove: async () => { value = null; } };
}
void test('vault validates records, installation identity and uncertain refresh on restore', async () => {
  const memory = storage(); const vault = createSessionVault(memory, deviceId);
  await vault.save(session(), 3);
  assert.deepEqual(await vault.load(), { session: session(), generation: 3 });
  await vault.markRefreshPending(session(), 3);
  assert.equal(await vault.load(), null); assert.equal(await memory.read(), null);
  await vault.save(session(), 4);
  assert.equal(await createSessionVault(memory, '123e4567-e89b-42d3-a456-426614174002').load(), null);
  for (const invalid of ['{', JSON.stringify({ session: session() }), JSON.stringify({ format: 1, installationId: deviceId, generation: 1, refreshPending: false, session: { ...session(), accessToken: 7 } })]) {
    await memory.write(invalid); assert.equal(await vault.load(), null); assert.equal(await memory.read(), null);
  }
});
void test('logout clear follows a delayed save and failed writes do not poison queue', async () => {
  const memory = storage(); const gate = deferred<void>();
  const vault = createSessionVault({ ...memory, write: async (value) => { await gate.promise; await memory.write(value); } }, deviceId);
  const saving = vault.save(session(), 1); const clearing = vault.clear(); gate.resolve();
  await Promise.all([saving, clearing]); assert.equal(await memory.read(), null);
  const failing = createSessionVault({ ...memory, write: async () => { throw new Error('secret'); } }, deviceId);
  await assert.rejects(failing.save(session(), 1), { kind: 'storage' }); await failing.clear();
});
void test('save snapshots input and rejects malformed session before writing', async () => {
  const memory = storage(); const vault = createSessionVault(memory, deviceId); const original = session();
  const saving = vault.save(original, 1); original.refreshToken = 'changed'; await saving;
  assert.equal((await vault.load())?.session.refreshToken, 'fixture-refresh');
  await assert.rejects(vault.save({ ...session(), refreshToken: '' }, 1), { kind: 'storage' });
});
