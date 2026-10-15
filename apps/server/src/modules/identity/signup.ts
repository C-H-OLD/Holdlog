import type Database from 'better-sqlite3';
import type { components } from '@holdlog/contracts/http';
import { isUniqueViolation } from '../../database/errors.js';
import { withTransaction } from '../../database/transaction.js';
import * as repository from './identity.repository.js';
import { IdentityError, invalid, unauthenticated } from './errors.js';
import { issueSession, type MobileSession } from './mobile-session.js';
import { signupRequestKey, type SignupRequestLocks } from './signup-request-locks.js';
type Input = components['schemas']['CompleteSignupInput'];

/**
 * Complete a named signup in one IMMEDIATE transaction, including proof consumption, family, installation and minimal receipt.
 * key must already be normalized. Input errors leave the proof usable. Entry contention is nonblocking 409;
 * consumed/expired proof is 401. A unique collision rolls back before one fresh identity/proof recheck.
 * No token/body enters a receipt. Throws IdentityError for business denials and storage errors otherwise.
 */
export function completeSignup(db: Database.Database, input: Input, key: string, locks: SignupRequestLocks): MobileSession {
  const name = input.name.trim(); if (!name) throw invalid('name');
  const deviceId = repository.normalizeUuid(input.deviceId);
  /** Recheck unconsumed proof lifetime and exact installation; never derive authority from a request receipt. */
  const validProof = (): repository.ProofRow => {
    const proof = repository.findProof(db, repository.hashSecret(input.signupToken));
    if (!proof?.valid || proof.device_id !== deviceId) throw unauthenticated();
    return proof;
  };
  /** Execute one attempt; returning a business denial lets proof/receipt changes commit before it is thrown. */
  const attempt = (): MobileSession | IdentityError => {
    let held: string | undefined;
    try {
      return withTransaction(db, () => {
        let proof = validProof();
        const receiptKey = { principalScope: 'signup' as const, principalId: proof.id, operation: 'completeSignup', key };
        const requestHash = repository.hashSecret(JSON.stringify({ name, deviceId }));
        const entry = signupRequestKey(proof.id, key);
        if (!locks.tryAcquire(entry)) {
          validProof();
          const receipt = repository.readReceipt(db, receiptKey);
          throw new IdentityError(409, receipt && receipt.request_hash !== requestHash ? 'IDEMPOTENCY_MISMATCH' : 'REQUEST_IN_PROGRESS');
        }
        held = entry;
        proof = validProof();
        const receipt = repository.readReceipt(db, receiptKey);
        if (receipt && receipt.request_hash !== requestHash) throw new IdentityError(409, 'IDEMPOTENCY_MISMATCH');
        const existing = repository.findIdentity(db, proof.provider, proof.provider_subject);
        if (existing) {
          repository.consumeProof(db, proof.id);
          repository.writeReceipt(db, { ...receiptKey, requestHash, resultStatus: 409, errorCode: 'SIGNUP_ALREADY_COMPLETED' });
          return new IdentityError(409, 'SIGNUP_ALREADY_COMPLETED');
        }
        const accountId = repository.insertAccount(db, proof, name);
        const session = issueSession(db, accountId, proof.device_id);
        // Installation writes can outlast a proof; roll back the provisional account/session on expiry.
        validProof();
        repository.consumeProof(db, proof.id);
        repository.writeReceipt(db, { ...receiptKey, requestHash, resultStatus: 201, resultResourceId: accountId });
        return session;
      });
    } finally { if (held) locks.release(held); }
  };
  let result: MobileSession | IdentityError;
  try { result = attempt(); }
  catch (error) {
    if (!isUniqueViolation(error)) throw error;
    result = attempt();
  }
  if (result instanceof IdentityError) throw result;
  return result;
}
