import type { MobileProfileApi, Profile } from '../api/holdlog/profile.ts';
import { MobileIdentityError } from '../api/holdlog/client.ts';
import type { MobileAuthStore } from '../providers/mobileAuthStore.ts';

/**
 * Own one account's name draft and versioned command. Errors preserve the draft;
 * the caller may fetch and rebase a conflict before explicitly retrying. Photo
 * bytes/ready/upload orchestration belongs to T018/T032 after 011 integration.
 */
export function createEditProfile(options: { auth: MobileAuthStore; api: MobileProfileApi; profile: Profile; newRequestKey(): string }) {
  const generation = options.auth.getSnapshot().generation;
  const accountId = options.profile.id;
  let version = options.profile.version;
  let name = options.profile.name;
  let busy = false;
  let attempt: { fingerprint: string; key: string } | null = null;
  let snapshot: Readonly<{ name: string; version: number; busy: boolean }> = Object.freeze({ name, version, busy });
  const listeners = new Set<() => void>();
  /** Reject stale drafts before touching authenticated transport or the current account. */
  function check(): void {
    const current = options.auth.getSnapshot();
    if (current.generation !== generation || current.profile?.id !== accountId || current.status !== 'authenticated') throw new MobileIdentityError('stale');
  }
  /** Keep the React external-store snapshot stable between actual draft changes. */
  function publish(): void { snapshot = Object.freeze({ name, version, busy }); for (const listener of listeners) { try { listener(); } catch { /* Observers cannot interrupt command settlement. */ } } }
  return {
    getSnapshot: () => snapshot,
    /** Observe changes; unsubscribe when the form owner leaves. */
    subscribe(this: void, listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; },
    /** Preserve exact user input while validating normalized command input on submit. */
    setName(this: void, value: string): void { check(); if (!busy) { name = value; publish(); } },
    /** Adopt a fetched version while preserving the user's name draft after a conflict. */
    rebase(this: void, profile: Profile): void { check(); if (profile.id !== accountId || busy) throw new MobileIdentityError('stale'); version = profile.version; attempt = null; publish(); },
    /** Submit once, retain the input/key on definitive failure and guard late responses by generation. */
    async submit(this: void): Promise<void> {
      check(); if (busy) throw new MobileIdentityError('unavailable');
      const normalized = name.trim(); if (!normalized) throw new MobileIdentityError('input');
      const fingerprint = JSON.stringify([normalized, version]);
      if (attempt?.fingerprint !== fingerprint) attempt = { fingerprint, key: options.newRequestKey() };
      const command = { name: normalized }; const key = attempt.key; const expectedVersion = version;
      busy = true; publish();
      try {
        check();
        const profile = await options.auth.withAccess(({ accessToken, signal }) => options.api.edit(command, { accessToken, key, version: expectedVersion }, signal));
        check(); await options.auth.updateProfile(profile, generation); check();
        version = profile.version; name = profile.name; attempt = null;
      } finally { busy = false; publish(); }
    },
  };
}

export type EditProfile = ReturnType<typeof createEditProfile>;
