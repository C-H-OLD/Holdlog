/* eslint-disable @typescript-eslint/require-await -- Async fakes intentionally model injected native/network ports. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEditProfile } from '../src/lib/editProfile.ts';
import { MobileIdentityError } from '../src/api/holdlog/client.ts';
import { createMobileAuthStore } from '../src/providers/mobileAuthStore.ts';
import { createSessionVault } from '../src/lib/secureSession.ts';
import { deferred, deviceId, now, session } from './identity-fixtures.ts';

/** A real pure auth owner makes stale profile application observable. */
async function setup() {
  const vault = createSessionVault({ read: async () => null, write: async () => undefined, remove: async () => undefined }, deviceId);
  const auth = createMobileAuthStore({ api: { challenge: async () => ({ challengeId: deviceId, nonce: 'fixture', expiresAt: '2026-10-19T00:05:00Z' }), login: async () => ({ kind: 'authenticated', session: session() }), signup: async () => session(), refresh: async () => session(), logout: async () => undefined }, provider: { authorize: async () => ({ idToken: 'fixture', authorizationCode: null }) }, vault, deviceId, now: () => now, newRequestKey: () => deviceId, clearAccountState: async () => undefined });
  await auth.login('google'); return auth;
}
void test('name edit preserves draft and stable key on conflict/transient errors, then applies committed version', async () => {
  const auth = await setup(); const keys: string[] = []; let failure = true;
  const edit = createEditProfile({ auth, api: { get: async () => session().profile, edit: async (input, command) => { keys.push(command.key); if (failure) throw new MobileIdentityError('http', 412, 'VERSION_CONFLICT'); return { ...session().profile, name: input.name!, version: 2 }; } }, profile: session().profile, newRequestKey: () => `${keys.length}` });
  edit.setName('   '); await assert.rejects(edit.submit(), { kind: 'input' }); assert.equal(keys.length, 0);
  edit.setName(' New name '); await assert.rejects(edit.submit(), { status: 412 }); assert.equal(edit.getSnapshot().name, ' New name ');
  failure = false; await edit.submit(); assert.equal(keys[0], keys[1]); assert.equal(auth.getSnapshot().profile?.version, 2);
  assert.equal(auth.getSnapshot().profile?.name, 'New name');
});
void test('old account draft and late responses never update the next account', async () => {
  const auth = await setup(); const gate = deferred<ReturnType<typeof session>['profile']>();
  const edit = createEditProfile({ auth, api: { get: async () => session().profile, edit: async () => gate.promise }, profile: session().profile, newRequestKey: () => deviceId });
  edit.setName('Private draft'); const pending = edit.submit(); await auth.logout(); gate.resolve({ ...session().profile, name: 'Late' });
  await assert.rejects(pending, { kind: 'stale' }); assert.equal(auth.getSnapshot().profile, null);
  await auth.login('apple'); await assert.rejects(edit.submit(), { kind: 'stale' });
});
