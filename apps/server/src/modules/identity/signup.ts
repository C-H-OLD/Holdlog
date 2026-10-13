import type pg from 'pg';
import type { components } from '@holdlog/contracts/http';
import { withTransaction } from '../../database/transaction.js';
import * as repository from './identity.repository.js';
import { IdentityError, invalid, unauthenticated } from './errors.js';
import { issueSession, type MobileSession } from './mobile-session.js';
type Input = components['schemas']['CompleteSignupInput'];

/** Recheck unconsumed proof lifetime and exact installation; never derive authority from a request receipt. */
async function validProof(client: pg.PoolClient, input: Input): Promise<repository.ProofRow> {
  const proof = await repository.findProof(client, repository.hashSecret(input.signupToken));
  if (!proof?.valid || proof.device_id !== input.deviceId.toLowerCase()) throw unauthenticated();
  return proof;
}

/**
 * Complete a named signup in one transaction, including proof consumption, family, installation and minimal receipt.
 * Input errors leave the proof usable. Contention is nonblocking409; consumed/expired proof is401.
 * Unique collisions roll back before one fresh identity/proof recheck. No token/body enters a receipt.
 */
export async function completeSignup(pool: pg.Pool, input: Input, key: string): Promise<MobileSession> {
  const name = input.name.trim(); if (!name) throw invalid('name');
  /** Execute one attempt; returning a business denial lets proof/receipt changes commit before it is thrown. */
  async function attempt(): Promise<MobileSession | IdentityError> {
    return withTransaction(pool, async client => {
      let proof = await validProof(client, input);
      const receiptKey = { principalScope: 'signup' as const, principalId: proof.id, operation: 'completeSignup', key };
      const requestHash = repository.hashSecret(JSON.stringify({ name, deviceId: input.deviceId.toLowerCase() }));
      if (!await repository.trySignupRequestLock(client, proof.id, key)) {
        await validProof(client, input);
        const receipt = await repository.readReceipt(client, receiptKey);
        throw new IdentityError(409, receipt && receipt.request_hash !== requestHash ? 'IDEMPOTENCY_MISMATCH' : 'REQUEST_IN_PROGRESS');
      }
      await repository.lockIdentityState(client, { identity: { provider: proof.provider, subject: proof.provider_subject }, proofId: proof.id });
      proof = await validProof(client, input);
      const receipt = await repository.readReceipt(client, receiptKey);
      if (receipt && receipt.request_hash !== requestHash) throw new IdentityError(409, 'IDEMPOTENCY_MISMATCH');
      const existing = await repository.findIdentity(client, proof.provider, proof.provider_subject);
      if (existing) {
        await repository.consumeProof(client, proof.id);
        await repository.writeReceipt(client, { ...receiptKey, requestHash, resultStatus: 409, errorCode: 'SIGNUP_ALREADY_COMPLETED' });
        return new IdentityError(409, 'SIGNUP_ALREADY_COMPLETED');
      }
      const accountId = await repository.insertAccount(client, proof, name);
      const session = await issueSession(client, accountId, proof.device_id);
      // Installation locks can outlast a proof; rollback provisional account/session on expiry.
      await validProof(client, input);
      await repository.consumeProof(client, proof.id);
      await repository.writeReceipt(client, { ...receiptKey, requestHash, resultStatus: 201, resultResourceId: accountId });
      return session;
    });
  }
  let result: MobileSession | IdentityError;
  try { result = await attempt(); }
  catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === '23505')) throw error;
    result = await attempt();
  }
  if (result instanceof IdentityError) throw result;
  return result;
}
