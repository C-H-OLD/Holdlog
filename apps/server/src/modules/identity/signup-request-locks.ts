import { normalizeUuid } from './identity.repository.js';

/**
 * Build the entry-lock key for one proof/operation/request key, matching the former advisory-lock input.
 * Both UUIDs are normalized, so case and urn:uuid: spellings of the same key collide.
 */
export function signupRequestKey(proofId: string, key: string): string {
  return JSON.stringify(['signup-request', normalizeUuid(proofId), 'completeSignup', normalizeUuid(key)]);
}

/**
 * Nonblocking completeSignup entry locks held in this API process (contract: same key in progress → 409 before
 * any business wait). There is one API process (docs/architecture/server.md:13), so memory replaces the
 * PostgreSQL transaction advisory lock. Holders must release in finally; nothing is persisted.
 */
export class SignupRequestLocks {
  private readonly held = new Set<string>();

  /** Take the key without waiting; returns false when another request of this process holds it. */
  tryAcquire(key: string): boolean {
    if (this.held.has(key)) return false;
    this.held.add(key);
    return true;
  }

  /** Release a key taken by tryAcquire; releasing an absent key does nothing. */
  release(key: string): void { this.held.delete(key); }
}
