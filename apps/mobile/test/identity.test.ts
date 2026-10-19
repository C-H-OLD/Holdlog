/* eslint-disable @typescript-eslint/require-await -- Async fakes intentionally model injected native/network ports. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MobileIdentityApi } from '../src/api/holdlog/auth.ts';
import { MobileIdentityError } from '../src/api/holdlog/client.ts';
import { createMobileAuthStore, type MobileAuthOptions } from '../src/providers/mobileAuthStore.ts';
import { createSessionVault, type SecretStorage } from '../src/lib/secureSession.ts';
import { deferred, deviceId, now, session } from './identity-fixtures.ts';

/** Inject every side effect; no real SNS credential or native keychain is used. */
function setup(overrides: Partial<MobileIdentityApi> = {}, ports: Partial<Pick<MobileAuthOptions, 'provider' | 'clearAccountState' | 'now'>> = {}) {
  let stored: string | null = null; let key = 0; let cleanup = 0;
  const api: MobileIdentityApi = {
    challenge: async () => ({ challengeId: deviceId, nonce: 'fixture-nonce', expiresAt: '2026-10-19T00:05:00Z' }),
    login: async () => ({ kind: 'authenticated', session: session() }),
    signup: async () => session(), refresh: async () => session({ accessToken: 'rotated-access', refreshToken: 'rotated-refresh' }), logout: async () => undefined, ...overrides,
  };
  const storage: SecretStorage = { read: async () => stored, write: async (value) => { stored = value; }, remove: async () => { stored = null; } };
  const vault = createSessionVault(storage, deviceId);
  const store = createMobileAuthStore({ api, vault, deviceId, provider: { authorize: async () => ({ idToken: 'fixture-provider', authorizationCode: null }) }, now: () => now, newRequestKey: () => `123e4567-e89b-42d3-a456-${String(++key).padStart(12, '0')}`, clearAccountState: async () => { cleanup++; }, ...ports });
  return { store, api, vault, storage, stored: () => stored, cleanup: () => cleanup };
}
void test('existing login publishes only after durable save and exposes no tokens', async () => {
  const { store, stored } = setup(); await store.login('google');
  assert.equal(store.getSnapshot().status, 'authenticated'); assert.ok(stored());
  assert.doesNotMatch(JSON.stringify(store.getSnapshot()), /fixture-access|fixture-refresh|fixture-provider/);
  assert.equal(await store.withAccess(async ({ accessToken }) => accessToken), 'fixture-access');
});
void test('signup gates protected requests, retains retries and commits once', async () => {
  const calls: string[] = []; let fail = true;
  const { store } = setup({ login: async () => ({ kind: 'signup_required', signup: { signupToken: 'proof-secret', expiresAt: '2026-10-19T00:15:00Z' } }), signup: async (_input, key) => { calls.push(key); if (fail) throw new MobileIdentityError('http', 503, 'TEMPORARY_FAILURE'); return session(); } });
  await store.login('apple'); assert.equal(store.getSnapshot().status, 'signupRequired');
  await assert.rejects(store.withAccess(async () => 1), { kind: 'reauthenticate' });
  store.setSignupName(' Climber '); store.selectSignupPhoto({ kind: 'selected', uri: 'file:///photo' });
  await assert.rejects(store.completeSignup(), { status: 503 });
  assert.equal(store.getSnapshot().signup?.name, ' Climber '); assert.equal(store.getSnapshot().signup?.hasPhoto, true);
  fail = false; await store.completeSignup(); assert.equal(calls[0], calls[1]); assert.equal(store.getSnapshot().status, 'authenticated');
  assert.equal(store.takeSignupPhoto(), 'file:///photo'); assert.equal(store.takeSignupPhoto(), null);
});
void test('response loss, consumed proof and secure save failure require new SNS authentication', async () => {
  for (const error of [new MobileIdentityError('network'), new MobileIdentityError('http', 401, 'UNAUTHENTICATED')]) {
    const { store } = setup({ login: async () => ({ kind: 'signup_required', signup: { signupToken: 'proof-secret', expiresAt: '2026-10-19T00:15:00Z' } }), signup: async () => { throw error; } });
    await store.login('google'); store.setSignupName('Climber'); await assert.rejects(store.completeSignup());
    assert.equal(store.getSnapshot().status, 'signedOut'); assert.equal(store.getSnapshot().signup, null);
  }
  const { store, vault } = setup(); vault.save = async () => { throw new Error('platform-secret'); };
  await assert.rejects(store.login('google'), { kind: 'storage' }); assert.equal(store.getSnapshot().status, 'signedOut');
});
void test('one refresh serves concurrent callers; logout invalidates late results and revokes rotated token', async () => {
  const gate = deferred<ReturnType<typeof session>>(); let refreshes = 0; const revoked: string[] = [];
  const { store, stored } = setup({ refresh: async () => { refreshes++; return gate.promise; }, logout: async (token) => { revoked.push(token); } });
  await store.login('google'); const first = store.refresh(); const second = store.refresh();
  await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(refreshes, 1);
  const loggingOut = store.logout(); assert.equal(store.getSnapshot().status, 'signedOut');
  gate.resolve(session({ accessToken: 'rotated-access', refreshToken: 'rotated-refresh' }));
  const results = await Promise.allSettled([first, second, loggingOut]);
  assert.equal(results[0]?.status, 'rejected'); assert.equal(results[2]?.status, 'fulfilled');
  assert.deepEqual(revoked, ['rotated-access']); assert.equal(stored(), null);
});
void test('transient refresh preserves valid session; unknown rotation is never replayed', async () => {
  let calls = 0; let error = new MobileIdentityError('http', 503, 'TEMPORARY_FAILURE');
  const { store } = setup({ refresh: async () => { calls++; throw error; } });
  await store.login('google'); await assert.rejects(store.refresh(), { status: 503 });
  assert.equal(store.getSnapshot().status, 'authenticated');
  error = new MobileIdentityError('network'); await assert.rejects(store.refresh(), { kind: 'network' });
  assert.equal(await store.withAccess(async () => 'valid-access'), 'valid-access');
  await assert.rejects(store.refresh(), { kind: 'reauthenticate' }); assert.equal(calls, 2);
  assert.equal(store.getSnapshot().status, 'signedOut');
});
void test('late authorized read, cancelled provider and reentrant subscriber cannot install authority', async () => {
  const { store } = setup(); await store.login('google'); const response = deferred<number>();
  const reading = store.withAccess(async () => response.promise); await store.logout(); response.resolve(1);
  await assert.rejects(reading, { kind: 'stale' });
  let logout: Promise<void> | undefined;
  const unsubscribe = store.subscribe(() => { if (store.getSnapshot().status === 'authenticating') logout = store.logout(); });
  await assert.rejects(store.login('google'), { kind: 'stale' }); await logout; unsubscribe();
  assert.equal(store.getSnapshot().status, 'signedOut');
});
void test('profile persistence cannot make an uncertain rotated refresh token reusable', async () => {
  let calls = 0;
  const { store, stored } = setup({ refresh: async () => { calls++; throw new MobileIdentityError('network'); } });
  await store.login('google'); await assert.rejects(store.refresh());
  await store.updateProfile({ ...session().profile, name: 'Edited', version: 2 }, store.getSnapshot().generation);
  assert.equal((JSON.parse(stored()!) as { refreshPending: boolean }).refreshPending, true);
  await assert.rejects(store.refresh(), { kind: 'reauthenticate' }); assert.equal(calls, 1);
});
void test('profile waits for a running rotation and keeps its new credentials', async () => {
  const gate = deferred<ReturnType<typeof session>>();
  const { store, stored } = setup({ refresh: async () => gate.promise }); await store.login('google');
  const rotating = store.refresh();
  const editing = store.updateProfile({ ...session().profile, name: 'Edited', version: 2 }, store.getSnapshot().generation);
  gate.resolve(session({ accessToken: 'new-access', refreshToken: 'new-refresh' })); await Promise.all([rotating, editing]);
  assert.equal(await store.withAccess(async ({ accessToken }) => accessToken), 'new-access');
  assert.equal((JSON.parse(stored()!) as { session: { refreshToken: string } }).session.refreshToken, 'new-refresh');
  assert.equal(store.getSnapshot().profile?.version, 2);
});
void test('new installation login waits for the prior session revocation', async () => {
  const gate = deferred<void>(); let logins = 0;
  const { store } = setup({ login: async () => { logins++; return { kind: 'authenticated', session: session() }; }, logout: async () => gate.promise });
  await store.login('google'); const logout = store.logout(); const login = store.login('google');
  await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(logins, 1);
  gate.resolve(); await Promise.all([logout, login]); assert.equal(logins, 2); assert.equal(store.getSnapshot().status, 'authenticated');
});
void test('logout attempts remote revocation even when local cleanup fails', async () => {
  let revoked = 0;
  const { store, vault } = setup({ logout: async () => { revoked++; } }); await store.login('google');
  vault.clear = async () => { throw new MobileIdentityError('storage'); };
  await assert.rejects(store.logout(), { kind: 'cleanup' }); assert.equal(revoked, 1);
  assert.equal(store.getSnapshot().status, 'signedOut');
});
void test('late signup completes and is revoked before another installation login', async () => {
  const gate = deferred<ReturnType<typeof session>>(); const events: string[] = []; let logins = 0;
  const { store } = setup({ login: async () => { logins++; events.push('login'); return logins === 1 ? { kind: 'signup_required', signup: { signupToken: 'proof', expiresAt: '2026-10-19T00:15:00Z' } } : { kind: 'authenticated', session: session() }; }, signup: async () => { events.push('signup'); return gate.promise; }, logout: async () => { events.push('revoke'); } });
  await store.login('google'); store.setSignupName('Climber'); const signup = store.completeSignup();
  await new Promise<void>(resolve => setImmediate(resolve)); const replacement = store.login('apple');
  gate.resolve(session()); await assert.rejects(signup, { kind: 'stale' }); await replacement;
  assert.deepEqual(events, ['login', 'signup', 'revoke', 'login']); assert.equal(store.getSnapshot().status, 'authenticated');
});
void test('provider cancellation and definitive 401 clear local authority while PendingInvite stays separately owned', async () => {
  const state = { queries: ['account-query'], draft: 'account-draft', invite: 'pending-invite' };
  let clears = 0;
  /** Model the composition port: clear account data without consuming a separately owned invite. */
  const clearAccountState = async (): Promise<void> => { clears++; state.queries = []; state.draft = ''; };
  const cancelled = setup({}, { provider: { authorize: async () => { throw new MobileIdentityError('cancelled'); } }, clearAccountState });
  await assert.rejects(cancelled.store.login('apple'), { kind: 'cancelled' }); assert.equal(cancelled.store.getSnapshot().status, 'signedOut');
  const { store } = setup({ refresh: async () => { throw new MobileIdentityError('contract', 401); } }, { clearAccountState });
  await store.login('google'); state.queries = ['account-query']; state.draft = 'account-draft'; const before = clears;
  await assert.rejects(store.refresh(), { status: 401 });
  assert.equal(store.getSnapshot().status, 'signedOut'); assert.ok(clears > before);
  assert.deepEqual(state.queries, []); assert.equal(state.draft, ''); assert.equal(state.invite, 'pending-invite');
});
void test('restore uses the installation record and storage save gates protected access', async () => {
  let revoked = 0;
  const { store, vault, storage } = setup({ logout: async () => { revoked++; } }); await vault.save(session(), 40); await store.restore(); assert.equal(store.getSnapshot().status, 'authenticated');
  await store.logout(); const gate = deferred<void>(); const writing = deferred<void>(); const original = storage.write.bind(storage);
  storage.write = async (value) => { writing.resolve(); await gate.promise; return original(value); };
  const login = store.login('google'); await writing.promise;
  assert.equal(store.getSnapshot().status, 'authenticating'); await assert.rejects(store.withAccess(async () => 1), { kind: 'reauthenticate' });
  const logout = store.logout(); gate.resolve(); await assert.rejects(login, { kind: 'stale' }); await logout;
  assert.equal(store.getSnapshot().status, 'signedOut'); assert.equal(await vault.load(), null);
  assert.equal(revoked, 2);
});
void test('concurrent profile responses cannot persist a lower version', async () => {
  const { store, storage, stored } = setup(); await store.login('google');
  const gate = deferred<void>(); const writing = deferred<void>(); const original = storage.write.bind(storage); let writes = 0;
  storage.write = async (value) => { if (++writes === 1) { writing.resolve(); await gate.promise; } return original(value); };
  const owner = store.getSnapshot().generation;
  const latest = store.updateProfile({ ...session().profile, name: 'Latest', version: 3 }, owner);
  const older = store.updateProfile({ ...session().profile, name: 'Older', version: 2 }, owner);
  await writing.promise; gate.resolve(); await Promise.all([latest, older]);
  assert.equal(store.getSnapshot().profile?.version, 3);
  assert.equal((JSON.parse(stored()!) as { session: { profile: { version: number } } }).session.profile.version, 3);
});
void test('a queued profile save cannot erase the refresh-pending crash marker', async () => {
  const { store, vault, stored } = setup({ refresh: async () => { throw new MobileIdentityError('network'); } }); await store.login('google');
  const edit = store.updateProfile({ ...session().profile, version: 2 }, store.getSnapshot().generation);
  const refresh = store.refresh(); await edit; await assert.rejects(refresh, { kind: 'network' });
  assert.equal((JSON.parse(stored()!) as { refreshPending: boolean }).refreshPending, true);
  assert.equal(await vault.load(), null);
});
void test('cold restore preserves the credential pair only for a confirmed refresh 503', async () => {
  for (const failure of [new MobileIdentityError('http', 503, 'TEMPORARY_FAILURE'), new MobileIdentityError('contract', 503), new MobileIdentityError('network')]) {
    const { store, vault, stored } = setup({ refresh: async () => { throw failure; } });
    await vault.save(session({ accessExpiresAt: '2026-10-18T23:59:00Z' }), 1);
    await assert.rejects(store.restore(), error => error === failure);
    if (failure.kind === 'http') {
      assert.equal(store.getSnapshot().status, 'authenticated');
      assert.equal((JSON.parse(stored()!) as { refreshPending: boolean }).refreshPending, false);
      assert.equal((await vault.load())?.session.refreshToken, 'fixture-refresh');
    } else { assert.equal(store.getSnapshot().status, 'signedOut'); assert.equal(stored(), null); }
  }
});
void test('successful rotation is revoked if durable installation fails', async () => {
  const revoked: string[] = [];
  const { store, storage, stored } = setup({ logout: async (token) => { revoked.push(token); } });
  await store.login('google'); const original = storage.write.bind(storage); let writes = 0;
  storage.write = async (value) => { if (++writes === 2) throw new Error('platform-secret'); await original(value); };
  await assert.rejects(store.refresh(), { kind: 'storage' });
  assert.deepEqual(revoked, ['rotated-access']); assert.equal(store.getSnapshot().status, 'signedOut'); assert.equal(stored(), null);
});
void test('abandoned rotated credentials are disposed before a replacement installation login', async () => {
  const events: string[] = []; const gate = deferred<void>(); const writing = deferred<void>();
  const { store, storage } = setup({ login: async () => { events.push('login'); return { kind: 'authenticated', session: session() }; }, logout: async (token) => { events.push('revoke:' + token); } });
  await store.login('google'); const original = storage.write.bind(storage); let writes = 0;
  storage.write = async (value) => { if (++writes === 2) { writing.resolve(); await gate.promise; } await original(value); };
  const rotating = store.refresh(); await writing.promise;
  const replacement = store.login('apple'); gate.resolve();
  await assert.rejects(rotating, { kind: 'stale' }); await replacement;
  assert.deepEqual(events, ['login', 'revoke:rotated-access', 'login']); assert.equal(store.getSnapshot().status, 'authenticated');
});
void test('logout reuses disposal already started for an unpersisted rotation', async () => {
  const disposing = deferred<void>(); const gate = deferred<void>(); let revokes = 0;
  const { store, storage } = setup({ logout: async () => { if (++revokes > 1) throw new MobileIdentityError('http', 401); disposing.resolve(); await gate.promise; } });
  await store.login('google'); const original = storage.write.bind(storage); let writes = 0;
  storage.write = async (value) => { if (++writes === 2) throw new Error('storage-unavailable'); await original(value); };
  const rotating = store.refresh(); await disposing.promise;
  const logout = store.logout(); gate.resolve();
  await assert.rejects(rotating, { kind: 'stale' }); await logout; assert.equal(revokes, 1);
});
void test('logout observes a shared rotation disposal failure without issuing a second revoke', async () => {
  const disposing = deferred<void>(); const gate = deferred<void>(); let revokes = 0;
  const { store, storage } = setup({ logout: async () => { revokes++; disposing.resolve(); await gate.promise; throw new MobileIdentityError('network'); } });
  await store.login('google'); const original = storage.write.bind(storage); let writes = 0;
  storage.write = async (value) => { if (++writes === 2) throw new Error('storage-unavailable'); await original(value); };
  const rotating = store.refresh(); await disposing.promise;
  const logout = store.logout(); gate.resolve();
  await assert.rejects(rotating, { kind: 'stale' }); await assert.rejects(logout, { kind: 'network' });
  assert.equal(revokes, 1); assert.equal(store.getSnapshot().status, 'signedOut');
});
