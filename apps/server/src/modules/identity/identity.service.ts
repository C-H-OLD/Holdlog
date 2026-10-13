import type pg from 'pg';
import type { components } from '@holdlog/contracts/http';
import { withTransaction } from '../../database/transaction.js';
import * as repository from './identity.repository.js';
import { IdentityError, invalid, unauthenticated } from './errors.js';
import { authorize, issueCredentials, issueSession, profile, secret, type MobileSession, type Profile } from './mobile-session.js';
import { completeSignup } from './signup.js';
export type LoginInput = components['schemas']['LoginInput'];
export interface VerifiedIdentity { provider: 'google' | 'apple'; subject: string; email: string | null }
export interface IdentityVerifier { verify(input: LoginInput, nonceHash: string): Promise<VerifiedIdentity> }

/** Coordinate mobile authentication and self-profile operations using one transaction client per mutation. */
export class IdentityService {
  /** Inject the owning pool and provider verifier; the verifier runs outside SQL transactions. */
  constructor(private readonly pool: pg.Pool, private readonly verifier: IdentityVerifier) {}

  /** Issue a fresh five-minute challenge and persist only its nonce digest; throws safe DB failure upstream. */
  async challenge(): Promise<components['schemas']['LoginChallenge']> {
    const nonce = secret(), row = await repository.insertChallenge(this.pool, repository.hashSecret(nonce));
    return { challengeId: row.id, nonce, expiresAt: row.expires_at.toISOString() };
  }

  /** Verify provider before locks, then consume the challenge once and return a session or limited proof atomically. */
  async login(input: LoginInput): Promise<components['schemas']['LoginResult']> {
    const challenge = await repository.findChallenge(this.pool, input.challengeId);
    if (!challenge?.valid) throw unauthenticated();
    const identity = await this.verifier.verify(input, challenge.nonce_hash);
    return withTransaction(this.pool, async client => {
      await repository.lockIdentityState(client, { identity, challengeId: challenge.id });
      if (!(await repository.findChallenge(client, challenge.id))?.valid) throw unauthenticated();
      const accountId = await repository.findIdentity(client, identity.provider, identity.subject);
      if (accountId) {
        await repository.lockIdentityState(client, { accountIds: [accountId] });
        if (!await repository.findAccount(client, accountId)) throw unauthenticated();
        const session = await issueSession(client, accountId, input.deviceId);
        // Account/installation waits must not extend the one-time challenge's authentication window.
        if (!(await repository.findChallenge(client, challenge.id))?.valid) throw unauthenticated();
        await repository.consumeChallenge(client, challenge.id);
        return { kind: 'authenticated', session };
      }
      const signupToken = secret();
      const expiry = await repository.insertProof(client, repository.hashSecret(signupToken), identity, input.deviceId);
      if (!(await repository.findChallenge(client, challenge.id))?.valid) throw unauthenticated();
      await repository.consumeChallenge(client, challenge.id);
      return { kind: 'signup_required', signup: { signupToken, expiresAt: expiry.toISOString() } };
    });
  }

  /** Complete only a verified proof's named signup; delegates request entry and identity/proof locking. */
  async signup(input: components['schemas']['CompleteSignupInput'], key: string): Promise<MobileSession> { return completeSignup(this.pool, input, key); }

  /** Rotate the current credential, or commit replay-family revocation before returning401. */
  async refresh(input: components['schemas']['RefreshInput']): Promise<MobileSession> {
    const hash = repository.hashSecret(input.refreshToken);
    const result = await withTransaction(this.pool, async client => {
      const found = await repository.findRefresh(client, hash);
      if (!found) throw unauthenticated();
      await repository.lockIdentityState(client, { accountIds: [found.account_id], sessionIds: [found.id], credentialIds: [found.credential_id] });
      if (found.device_id) await repository.lockDevice(client, found.device_id);
      const current = await repository.findRefresh(client, hash);
      if (!current) throw unauthenticated();
      if (current.used_at) { await repository.revokeSession(client, current); return unauthenticated(); }
      if (!current.valid || !current.credential_valid || current.device_id !== input.deviceId.toLowerCase()) throw unauthenticated();
      await repository.consumeRefresh(client, current.credential_id);
      return issueCredentials(client, current);
    });
    if (result instanceof IdentityError) throw result;
    return result;
  }

  /** Validate a Bearer session against current storage; exposed for downstream guards and services. */
  async authenticate(token: string): Promise<{ accountId: string; sessionId: string; deviceId: string | null }> {
    return withTransaction(this.pool, async client => { const session = await authorize(client, token); return { accountId: session.account_id, sessionId: session.id, deviceId: session.device_id }; });
  }

  /** Read only the current account's self projection after session/account revalidation. */
  async getProfile(token: string): Promise<Profile> { return withTransaction(this.pool, async client => profile(client, (await authorize(client, token)).account_id)); }

  /** Revoke this family and conditionally detach its still-current installation without removing account data. */
  async logout(token: string): Promise<components['schemas']['EmptyResult']> {
    return withTransaction(this.pool, async client => { const session = await authorize(client, token); await repository.revokeSession(client, session); await repository.disconnectDevice(client, session); return {}; });
  }

  /** Mutate name with current authorization, optimistic version and hash-only idempotency receipt in one transaction. */
  async editProfile(token: string, input: components['schemas']['ProfileInput'], version: number, key: string): Promise<Profile> {
    return withTransaction(this.pool, async client => {
      const session = await authorize(client, token), current = await profile(client, session.account_id);
      if (Object.keys(input).length === 0) throw invalid('body');
      const name = input.name?.trim(); if (input.name !== undefined && !name) throw invalid('name');
      // Asset ownership, ready-state checks and removal effects must be supplied by 011; do not enable partial photo writes.
      if (Object.hasOwn(input, 'photoFileId')) throw invalid('photoFileId');
      const requestHash = repository.hashSecret(JSON.stringify({ version, ...(name === undefined ? {} : { name }) }));
      const receiptKey = { principalScope: 'mobile' as const, principalId: session.account_id, operation: 'editMyProfile', key };
      const receipt = await repository.readReceipt(client, receiptKey);
      if (receipt) {
        if (receipt.request_hash !== requestHash) throw new IdentityError(409, 'IDEMPOTENCY_MISMATCH');
        return current;
      }
      if (version !== current.version) throw new IdentityError(412, 'VERSION_CONFLICT', [], current.version);
      if (name !== undefined) await repository.updateName(client, session.account_id, name);
      const updated = await profile(client, session.account_id);
      await repository.writeReceipt(client, { ...receiptKey, requestHash, resultStatus: 200, resultResourceId: session.account_id, resultVersion: updated.version });
      return updated;
    });
  }
}
