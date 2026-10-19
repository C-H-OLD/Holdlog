import { isMobileSession, type MobileIdentityApi, type MobileSession } from '../api/holdlog/auth.ts';
import { MobileIdentityError } from '../api/holdlog/client.ts';
import type { IdentityProvider, IdentityProviderAdapter } from '../lib/identityProviders.ts';
import type { SessionVault } from '../lib/secureSession.ts';
import { createSignupFlow, type PhotoSelection, type SignupSnapshot } from '../lib/signupFlow.ts';

export type AuthStatus = 'restoring' | 'signedOut' | 'authenticating' | 'signupRequired' | 'completingSignup' | 'authenticated';
export interface AuthSnapshot {
  readonly status: AuthStatus;
  readonly generation: number;
  readonly profile: Readonly<MobileSession['profile']> | null;
  readonly signup: SignupSnapshot | null;
}
export interface AuthorizedContext { accessToken: string; signal: AbortSignal; generation: number; accountId: string }
export interface MobileAuthOptions {
  api: MobileIdentityApi;
  vault: SessionVault;
  deviceId: string;
  provider: IdentityProviderAdapter;
  now(): number;
  newRequestKey(): string;
  /** Clear account queries and drafts; preserve/revalidate the separately owned 005 PendingInvite. */
  clearAccountState(): Promise<void>;
}

/** Strip unknown provider/storage exceptions before they reach UI or logs. */
function safeError(error: unknown, fallback: 'unavailable' | 'storage' = 'unavailable'): MobileIdentityError {
  return error instanceof MobileIdentityError ? error : new MobileIdentityError(fallback);
}
/** Responses known to have rolled back can be explicitly retried with the same input/key. */
function canRetrySignup(error: MobileIdentityError): boolean {
  return error.kind === 'input' || (error.kind === 'http' && (error.status === 400 || error.status === 503 || (error.status === 409 && error.code === 'REQUEST_IN_PROGRESS')));
}

/**
 * Own mobile authority independently of React/native SDKs. All secret state stays
 * private; storage succeeds before authenticated is published. Generation checks
 * follow every callback/await, so logout and a new account supersede late work.
 * Real SDK and screen activation require T029 and 003; no default fake is provided.
 */
export function createMobileAuthStore(options: MobileAuthOptions) {
  const flow = createSignupFlow(options);
  const listeners = new Set<() => void>();
  let generation = 0;
  let status: AuthStatus = 'signedOut';
  let session: MobileSession | null = null;
  let controller = new AbortController();
  let snapshot: AuthSnapshot = Object.freeze({ status, generation, profile: null, signup: null });
  let cleanupQueue: Promise<unknown> = Promise.resolve();
  let remoteQueue: Promise<unknown> = Promise.resolve();
  let commitQueue: Promise<unknown> = Promise.resolve();
  let restoring: Promise<void> | null = null;
  let refreshing: Promise<void> | null = null;
  let rotation: { owner: number; result: Promise<MobileSession>; cleanupClaimed: boolean; disposal: Promise<void> | null } | null = null;
  let uncertainRotation = false;
  let selectedPhoto: { accountId: string; generation: number; uri: string } | null = null;

  /** Order installation login/revocation effects, including stale login cleanup, before the next login. */
  function inRemoteOrder<T>(work: () => Promise<T>): Promise<T> {
    const pending = remoteQueue.catch(() => undefined).then(work);
    remoteQueue = pending.catch(() => undefined); return pending;
  }
  /** Read and write current credentials/profile together, rather than queuing stale snapshots. */
  function inCommitOrder<T>(work: () => Promise<T>): Promise<T> {
    const pending = commitQueue.catch(() => undefined).then(work);
    commitQueue = pending.catch(() => undefined); return pending;
  }

  /** Publish an immutable nonsecret view; observers cannot interrupt authority cleanup. */
  function publish(): void {
    const profile = session === null ? null : Object.freeze({ ...session.profile, identity: Object.freeze({ ...session.profile.identity }) });
    snapshot = Object.freeze({ status, generation, profile, signup: status === 'signupRequired' || status === 'completingSignup' ? flow.snapshot() : null });
    for (const listener of listeners) { try { listener(); } catch { /* Observer failure cannot retain credentials. */ } }
  }
  /** Reject results after any authority boundary, including a reentrant observer. */
  function check(owner: number): void { if (owner !== generation) throw new MobileIdentityError('stale'); }
  /**
   * Remove local authority before callbacks. Queue keychain/cache cleanup before
   * publishing so a reentrant login cannot install a new session ahead of it.
   */
  function boundary(next: AuthStatus): { owner: number; ready: Promise<void> } {
    const owner = ++generation;
    const oldController = controller;
    controller = new AbortController(); session = null; status = next;
    flow.clear(); selectedPhoto = null; uncertainRotation = false; refreshing = null;
    const ready = cleanupQueue.catch(() => undefined).then(async () => {
      const outcomes = await Promise.allSettled([options.vault.clear(), Promise.resolve().then(() => options.clearAccountState())]);
      if (outcomes.some(result => result.status === 'rejected')) throw new MobileIdentityError('cleanup');
    });
    cleanupQueue = ready.catch(() => undefined);
    oldController.abort(); publish();
    return { owner, ready };
  }
  /** Clear local authority even when the server or device storage is unavailable. */
  async function invalidate(owner: number): Promise<void> {
    if (owner !== generation) return;
    const next = boundary('signedOut'); await next.ready;
  }
  /** Store a validated session before opening protected queries or tabs. */
  async function install(next: MobileSession, owner: number, receipt?: { committed: boolean }): Promise<void> {
    return inCommitOrder(async () => {
      check(owner);
      if (!isMobileSession(next) || !next.accessToken || !next.refreshToken || Date.parse(next.refreshExpiresAt) <= options.now()) throw new MobileIdentityError('contract');
      const copy = JSON.parse(JSON.stringify(next)) as MobileSession;
      if (session?.profile.id === copy.profile.id && session.profile.version > copy.profile.version) copy.profile = session.profile;
      try { await options.vault.save(copy, owner); }
      catch { throw new MobileIdentityError('storage'); }
      check(owner); session = copy; status = 'authenticated'; uncertainRotation = false;
      if (receipt) receipt.committed = true;
      publish(); check(owner);
    });
  }
  /** Revoke issued credentials with safe errors; callers decide whether failure is best-effort. */
  function revokeIssued(next: MobileSession): Promise<void> {
    return Promise.resolve().then(() => options.api.logout(next.accessToken, options.newRequestKey())).catch(error => { throw safeError(error); });
  }
  /** Attempt revocation of a superseded issued session without replacing the original operation failure. */
  async function discard(next: MobileSession): Promise<void> {
    try { await revokeIssued(next); } catch { /* Local authority is already absent; do not leak tokens in errors. */ }
  }
  /** Keep issued credentials owned until durable commit or ordered remote disposal. */
  async function acceptIssued(next: MobileSession, owner: number, handoff?: { cleanupClaimed: boolean; disposal: Promise<void> | null }): Promise<void> {
    const receipt = { committed: false };
    try { await install(next, owner, receipt); }
    catch (error) {
      if (!receipt.committed && !handoff?.cleanupClaimed) {
        if (handoff) {
          // Claim before invoking external code; a concurrent logout reuses this exact result.
          handoff.cleanupClaimed = true; handoff.disposal = revokeIssued(next);
          try { await handoff.disposal; } catch { /* Preserve the originating failure; explicit logout still observes this rejection. */ }
        } else await discard(next);
      }
      throw error;
    }
  }
  /** Rotate once for all concurrent callers and mark the old token unsafe before sending. */
  function refresh(): Promise<void> {
    if (refreshing !== null) return refreshing;
    const owner = generation; const source = session; const signal = controller.signal;
    if (source === null || status !== 'authenticated') return Promise.reject(new MobileIdentityError('reauthenticate'));
    if (uncertainRotation || Date.parse(source.refreshExpiresAt) <= options.now()) return invalidate(owner).then(() => { throw new MobileIdentityError('reauthenticate'); });
    let resolveResult!: (value: MobileSession) => void;
    let rejectResult!: (error: unknown) => void;
    const raw = new Promise<MobileSession>((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
    // Logout may claim the wire result later; failed unclaimed attempts must not reject unhandled.
    void raw.catch(() => undefined);
    const attempt = { owner, result: raw, cleanupClaimed: false, disposal: null as Promise<void> | null };
    rotation = attempt;
    const task: Promise<void> = inRemoteOrder(async () => {
      try {
        try {
          // Reserve the crash marker in the same commit order as profile/session saves.
          await inCommitOrder(async () => { check(owner); await options.vault.markRefreshPending(session ?? source, owner); check(owner); });
        } catch { throw new MobileIdentityError('storage'); }
        check(owner);
        const next = await options.api.refresh({ refreshToken: source.refreshToken, deviceId: options.deviceId }, options.newRequestKey(), signal);
        if (next.profile.id !== source.profile.id) { await discard(next); throw new MobileIdentityError('reauthenticate'); }
        resolveResult(next);
        // Keep commit-or-dispose inside the server-effect queue, ahead of replacement login.
        await acceptIssued(next, owner, attempt);
      } catch (error) {
        rejectResult(error);
        check(owner); const failure = safeError(error);
        if (failure.status === 401 || failure.status === 403 || failure.kind === 'storage' || failure.kind === 'reauthenticate') await invalidate(owner);
        else if (failure.kind === 'http' && failure.status === 503) {
          try { await inCommitOrder(async () => { check(owner); await options.vault.save(session ?? source, owner); check(owner); }); }
          catch { await invalidate(owner); throw new MobileIdentityError('storage'); }
        } else uncertainRotation = true;
        throw failure;
      }
    });
    /** Release only this rotation; a superseding account may already own another task. */
    function release(): void { if (refreshing === task) refreshing = null; if (rotation === attempt) rotation = null; }
    void task.then(release, release);
    refreshing = task; return task;
  }
  return {
    /** Stable React external-store projection with no bearer token or signup proof. */
    getSnapshot: (): AuthSnapshot => snapshot,
    /** Subscribe to authority/form changes. Disposing the store is a separate owner action. */
    subscribe(this: void, listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; },
    /** Restore only this installation's committed record; interrupted rotation requires SNS login. */
    restore(): Promise<void> {
      if (restoring !== null) return restoring;
      if (status !== 'signedOut') return Promise.reject(new MobileIdentityError('unavailable'));
      const owner = ++generation; status = 'restoring'; publish();
      const task: Promise<void> = (async () => {
        try {
          await cleanupQueue; check(owner);
          const stored = await options.vault.load(); check(owner);
          if (stored === null || Date.parse(stored.session.refreshExpiresAt) <= options.now()) { await invalidate(owner); return; }
          // In-process generations identify operation lifetimes; no old process work survives restore.
          await install(stored.session, owner);
          if (session !== null && Date.parse(session.accessExpiresAt) <= options.now()) await refresh();
        } catch (error) {
          const failure = safeError(error, 'storage');
          if (owner !== generation) throw failure;
          // A confirmed rollback keeps the restored pair available for an explicit retry.
          if (snapshot.status === 'authenticated' && failure.kind === 'http' && failure.status === 503) throw failure;
          await invalidate(owner); throw failure;
        }
      })();
      /** Do not clear a newer restore when this lifetime settles. */
      function release(): void { if (restoring === task) restoring = null; }
      void task.then(release, release);
      restoring = task; return task;
    },
    /** Obtain a fresh challenge and provider credential. Cancellation leaves a signed-out session. */
    async login(provider: IdentityProvider): Promise<void> {
      const { owner, ready } = boundary('authenticating'); const signal = controller.signal;
      try {
        await ready; check(owner);
        const challenge = await options.api.challenge(options.newRequestKey(), signal); check(owner);
        const credential = await options.provider.authorize(provider, Object.freeze({ ...challenge }), signal); check(owner);
        if (Date.parse(challenge.expiresAt) <= options.now()) throw new MobileIdentityError('reauthenticate');
        await inRemoteOrder(async () => {
          check(owner);
          const response = await options.api.login({ provider, challengeId: challenge.challengeId, deviceId: options.deviceId, idToken: credential.idToken, authorizationCode: credential.authorizationCode }, options.newRequestKey(), signal);
          if (owner !== generation) { if (response.kind === 'authenticated') await discard(response.session); throw new MobileIdentityError('stale'); }
          if (response.kind === 'signup_required') { flow.begin(response.signup, owner); status = 'signupRequired'; publish(); check(owner); }
          else await acceptIssued(response.session, owner);
        });
        check(owner);
      } catch (error) {
        if (owner !== generation) throw new MobileIdentityError('stale');
        await invalidate(owner); throw safeError(error);
      }
    },
    /** Update only the current signup's name. The command owner locks it while submitting. */
    setSignupName(value: string): void { if (status === 'signupRequired') { flow.setName(value); publish(); } },
    /** Record a local photo choice; selection cancellation/denial preserves the existing draft. */
    selectSignupPhoto(value: PhotoSelection): void { if (status === 'signupRequired') { flow.selectPhoto(value); publish(); } },
    /** Finish name signup, keeping definitive failures retryable and unknown outcomes reauthenticating. */
    async completeSignup(): Promise<void> {
      const owner = generation;
      if (status !== 'signupRequired') throw new MobileIdentityError('unavailable');
      try {
        const command = flow.prepare(options.deviceId, owner); check(owner); status = 'completingSignup'; publish(); check(owner);
        const signal = controller.signal;
        await inRemoteOrder(async () => {
          check(owner);
          const response = await options.api.signup(command.input, command.key, signal);
          if (owner !== generation) { await discard(response); throw new MobileIdentityError('stale'); }
          const photo = flow.takePhoto(owner);
          await acceptIssued(response, owner); check(owner);
          flow.clear(); selectedPhoto = photo === null ? null : { accountId: response.profile.id, generation: owner, uri: photo };
        });
        check(owner);
      } catch (error) {
        check(owner); const failure = safeError(error);
        if (canRetrySignup(failure)) { flow.settle(); status = 'signupRequired'; publish(); }
        else await invalidate(owner);
        throw failure;
      }
    },
    /** Consume the current account's local selection for T032; never cross an auth generation. */
    takeSignupPhoto(): string | null {
      const selected = selectedPhoto; selectedPhoto = null;
      return selected !== null && session?.profile.id === selected.accountId && generation === selected.generation ? selected.uri : null;
    },
    refresh,
    /**
     * Execute one protected operation. No mutation is automatically replayed.
     * Unknown refresh rotation is never retried; late account results are rejected.
     */
    async withAccess<T>(request: (context: AuthorizedContext) => Promise<T>): Promise<T> {
      const owner = generation;
      if (status !== 'authenticated' || session === null) throw new MobileIdentityError('reauthenticate');
      if (Date.parse(session.accessExpiresAt) <= options.now()) await refresh();
      check(owner);
      if (session === null) throw new MobileIdentityError('reauthenticate');
      const context = { accessToken: session.accessToken, accountId: session.profile.id, generation: owner, signal: controller.signal };
      try { const value = await request(context); check(owner); return value; }
      catch (error) { check(owner); const failure = safeError(error); if (failure.status === 401 || failure.status === 403) await invalidate(owner); throw failure; }
    },
    /** Commit a profile response only to its initiating account and durable current session. */
    async updateProfile(profile: MobileSession['profile'], owner: number): Promise<void> {
      check(owner);
      // A profile result may arrive while the same account rotates its credential pair.
      if (refreshing !== null) { try { await refreshing; } catch { /* Preserve a still-valid session's pending marker below. */ } check(owner); }
      await inCommitOrder(async () => {
        check(owner);
        if (session === null || profile.id !== session.profile.id) throw new MobileIdentityError('stale');
        if (profile.version < session.profile.version) return;
        const next = JSON.parse(JSON.stringify({ ...session, profile })) as MobileSession;
        try {
          if (uncertainRotation) await options.vault.markRefreshPending(next, owner);
          else await options.vault.save(next, owner);
        } catch { await invalidate(owner); throw new MobileIdentityError('storage'); }
        check(owner); session = next; publish(); check(owner);
      });
    },
    /**
     * Immediately close local access, clear account state and then revoke remotely.
     * An in-flight rotation supplies its new token; remote failure remains visible.
     */
    async logout(): Promise<void> {
      const source = session; const pending = rotation?.owner === generation ? rotation : null;
      const disposal = pending?.disposal ?? null;
      // Explicit logout owns revocation; refresh must not dispose the same issued token twice.
      if (pending !== null) pending.cleanupClaimed = true;
      const next = boundary('signedOut');
      // Reserve the revocation before yielding to a reentrant/new authentication.
      const revocation = inRemoteOrder(async () => {
        if (source === null) return;
        if (disposal !== null) { await disposal; return; }
        let token = source.accessToken;
        if (pending !== null) { try { const rotated = await pending.result; if (rotated.profile.id === source.profile.id) token = rotated.accessToken; } catch { /* Report failure if the original credential no longer revokes. */ } }
        try { await options.api.logout(token, options.newRequestKey()); }
        catch (error) { throw safeError(error); }
      });
      // Attach both outcomes immediately so neither failure becomes an unhandled rejection.
      const outcomes = await Promise.allSettled([next.ready, revocation]);
      const remote = outcomes[1];
      if (remote?.status === 'rejected') throw safeError(remote.reason);
      if (outcomes[0]?.status === 'rejected') throw new MobileIdentityError('cleanup');
    },
    /** End an owner lifetime synchronously; callers may await durable cleanup. */
    async dispose(): Promise<void> { const next = boundary('signedOut'); listeners.clear(); await next.ready; },
  };
}

export type MobileAuthStore = ReturnType<typeof createMobileAuthStore>;
