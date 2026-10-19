import type { CompleteSignupInput, SignupProof } from '../api/holdlog/auth.ts';
import { MobileIdentityError } from '../api/holdlog/client.ts';

export type PhotoSelection = { kind: 'selected'; uri: string } | { kind: 'cancelled' | 'denied' };
export interface SignupSnapshot { readonly name: string; readonly hasPhoto: boolean; readonly busy: boolean }

/**
 * Keep the proof and optional local photo in memory, bound to one auth generation.
 * Snapshots contain no proof or URI. The owner must discard this flow at every
 * auth boundary; PendingInvite remains owned by 005 and is never consumed here.
 */
export function createSignupFlow(options: { now(): number; newRequestKey(): string }) {
  let proof: SignupProof | null = null;
  let generation = -1;
  let name = '';
  let photo: string | null = null;
  let busy = false;
  let attempt: { fingerprint: string; key: string } | null = null;
  /** Forget proof, inputs and retry keys on expiry, reauthentication or account change. */
  function clear(): void { proof = null; generation = -1; name = ''; photo = null; busy = false; attempt = null; }
  return {
    clear,
    /** Start a new signup; drafts never migrate between SNS authentications. */
    begin(next: SignupProof, ownerGeneration: number): void { clear(); proof = { ...next }; generation = ownerGeneration; },
    /** Expose only the existing form's nonsecret projection. */
    snapshot(): SignupSnapshot { return Object.freeze({ name, hasPhoto: photo !== null, busy }); },
    /** Lock input while a signup command is in flight. */
    setName(value: string): void { if (!busy) name = value; },
    /** Cancellation and denied permission leave both name and previous selection intact. */
    selectPhoto(selection: PhotoSelection): void { if (!busy && selection.kind === 'selected') photo = selection.uri; },
    /**
     * Capture the normalized command and stable retry key for the owner only.
     * Throws on missing/expired proof, stale generation, blank input or double submit.
     */
    prepare(deviceId: string, ownerGeneration: number): { input: CompleteSignupInput; key: string } {
      if (ownerGeneration !== generation) throw new MobileIdentityError('stale');
      if (proof === null || Date.parse(proof.expiresAt) <= options.now()) { clear(); throw new MobileIdentityError('reauthenticate'); }
      if (busy) throw new MobileIdentityError('unavailable');
      const normalized = name.trim();
      if (!normalized) throw new MobileIdentityError('input');
      const fingerprint = JSON.stringify([normalized, deviceId]);
      if (attempt?.fingerprint !== fingerprint) attempt = { fingerprint, key: options.newRequestKey() };
      busy = true;
      return { input: { signupToken: proof.signupToken, name: normalized, deviceId }, key: attempt.key };
    },
    /** Allow an explicit retry after a definitive noncommitting response. */
    settle(): void { busy = false; },
    /** Hand off an optional selection after durable session commit; never upload here. */
    takePhoto(ownerGeneration: number): string | null {
      if (ownerGeneration !== generation) return null;
      const selected = photo; photo = null; return selected;
    },
  };
}
