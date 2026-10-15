import type Database from 'better-sqlite3';
import type { components } from '@holdlog/contracts/http';
import { asPromise, withTransaction } from '../../database/transaction.js';
import * as repository from './identity.repository.js';
import { IdentityError, invalid, unauthenticated } from './errors.js';
import { authorize, issueCredentials, issueSession, profile, secret, type MobileSession, type Profile } from './mobile-session.js';
import { completeSignup } from './signup.js';
import { SignupRequestLocks } from './signup-request-locks.js';
export type LoginInput = components['schemas']['LoginInput'];
export interface VerifiedIdentity { provider: 'google' | 'apple'; subject: string; email: string | null }
export interface IdentityVerifier { verify(input: LoginInput, nonceHash: string): Promise<VerifiedIdentity> }

/**
 * Coordinate mobile authentication and self-profile operations, each mutation in one IMMEDIATE transaction.
 * Public methods keep their Promise signatures; synchronous storage failures surface as rejections.
 */
export class IdentityService {
  /** Inject the API connection, the provider verifier (run outside SQL transactions) and the process signup entry locks. */
  constructor(private readonly db: Database.Database, private readonly verifier: IdentityVerifier, private readonly locks: SignupRequestLocks = new SignupRequestLocks()) {}

  /** Issue a fresh five-minute challenge and persist only its nonce digest; rejects on storage failure. */
  challenge(): Promise<components['schemas']['LoginChallenge']> {
    return asPromise(() => {
      const nonce = secret(), row = withTransaction(this.db, () => repository.insertChallenge(this.db, repository.hashSecret(nonce)));
      return { challengeId: row.id, nonce, expiresAt: row.expires_at };
    });
  }

  /** Verify provider before the transaction, then consume the challenge once and return a session or limited proof atomically. */
  async login(input: LoginInput): Promise<components['schemas']['LoginResult']> {
    const challengeId = repository.normalizeUuid(input.challengeId), deviceId = repository.normalizeUuid(input.deviceId);
    const challenge = repository.findChallenge(this.db, challengeId);
    if (!challenge?.valid) throw unauthenticated();
    const identity = await this.verifier.verify(input, challenge.nonce_hash);
    return withTransaction(this.db, (): components['schemas']['LoginResult'] => {
      if (!repository.findChallenge(this.db, challenge.id)?.valid) throw unauthenticated();
      const accountId = repository.findIdentity(this.db, identity.provider, identity.subject);
      if (accountId) {
        if (!repository.findAccount(this.db, accountId)) throw unauthenticated();
        const session = issueSession(this.db, accountId, deviceId);
        // Installation writes must not extend the one-time challenge's authentication window.
        if (!repository.findChallenge(this.db, challenge.id)?.valid) throw unauthenticated();
        repository.consumeChallenge(this.db, challenge.id);
        return { kind: 'authenticated', session };
      }
      const signupToken = secret();
      const expiry = repository.insertProof(this.db, repository.hashSecret(signupToken), identity, deviceId);
      if (!repository.findChallenge(this.db, challenge.id)?.valid) throw unauthenticated();
      repository.consumeChallenge(this.db, challenge.id);
      return { kind: 'signup_required', signup: { signupToken, expiresAt: expiry } };
    });
  }

  /** Complete only a verified proof's named signup; normalizes the request key and delegates entry locking. */
  signup(input: components['schemas']['CompleteSignupInput'], key: string): Promise<MobileSession> {
    return asPromise(() => completeSignup(this.db, input, repository.normalizeUuid(key), this.locks));
  }

  /** Rotate the current credential, or commit replay-family revocation before rejecting with 401. */
  refresh(input: components['schemas']['RefreshInput']): Promise<MobileSession> {
    return asPromise(() => {
      const hash = repository.hashSecret(input.refreshToken), deviceId = repository.normalizeUuid(input.deviceId);
      const result = withTransaction(this.db, () => {
        const found = repository.findRefresh(this.db, hash);
        if (!found) throw unauthenticated();
        // The IMMEDIATE transaction replaced the row locks; the re-read keeps the former recheck order.
        const current = repository.findRefresh(this.db, hash);
        if (!current) throw unauthenticated();
        if (current.used_at) { repository.revokeSession(this.db, current); return unauthenticated(); }
        if (!current.valid || !current.credential_valid || current.device_id !== deviceId) throw unauthenticated();
        repository.consumeRefresh(this.db, current.credential_id);
        return issueCredentials(this.db, current);
      });
      if (result instanceof IdentityError) throw result;
      return result;
    });
  }

  /** Validate a Bearer session against current storage; exposed for downstream guards and services. */
  authenticate(token: string): Promise<{ accountId: string; sessionId: string; deviceId: string | null }> {
    return asPromise(() => withTransaction(this.db, () => { const session = authorize(this.db, token); return { accountId: session.account_id, sessionId: session.id, deviceId: session.device_id }; }));
  }

  /** Read only the current account's self projection after session/account revalidation. */
  getProfile(token: string): Promise<Profile> {
    return asPromise(() => withTransaction(this.db, () => profile(this.db, authorize(this.db, token).account_id)));
  }

  /** Revoke this family and conditionally detach its still-current installation without removing account data. */
  logout(token: string): Promise<components['schemas']['EmptyResult']> {
    return asPromise(() => withTransaction(this.db, () => { const session = authorize(this.db, token); repository.revokeSession(this.db, session); repository.disconnectDevice(this.db, session); return {}; }));
  }

  /** Mutate name with current authorization, optimistic version and hash-only idempotency receipt in one transaction. */
  editProfile(token: string, input: components['schemas']['ProfileInput'], version: number, key: string): Promise<Profile> {
    return asPromise(() => withTransaction(this.db, () => {
      const session = authorize(this.db, token), current = profile(this.db, session.account_id);
      if (Object.keys(input).length === 0) throw invalid('body');
      const name = input.name?.trim(); if (input.name !== undefined && !name) throw invalid('name');
      // Asset ownership, ready-state checks and removal effects must be supplied by 011; do not enable partial photo writes.
      if (Object.hasOwn(input, 'photoFileId')) throw invalid('photoFileId');
      const requestHash = repository.hashSecret(JSON.stringify({ version, ...(name === undefined ? {} : { name }) }));
      const receiptKey = { principalScope: 'mobile' as const, principalId: session.account_id, operation: 'editMyProfile', key: repository.normalizeUuid(key) };
      const receipt = repository.readReceipt(this.db, receiptKey);
      if (receipt) {
        if (receipt.request_hash !== requestHash) throw new IdentityError(409, 'IDEMPOTENCY_MISMATCH');
        return current;
      }
      if (version !== current.version) throw new IdentityError(412, 'VERSION_CONFLICT', [], current.version);
      if (name !== undefined) repository.updateName(this.db, session.account_id, name);
      const updated = profile(this.db, session.account_id);
      repository.writeReceipt(this.db, { ...receiptKey, requestHash, resultStatus: 200, resultResourceId: session.account_id, resultVersion: updated.version });
      return updated;
    }));
  }
}
