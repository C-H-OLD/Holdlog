import { createHash } from 'node:crypto';
import type pg from 'pg';

export interface IdentityLocks {
  identity?: { provider: 'google' | 'apple'; subject: string };
  challengeId?: string;
  proofId?: string;
  accountIds?: string[];
  sessionIds?: string[];
  credentialIds?: string[];
  deviceIds?: string[];
}
export interface ReceiptKey {
  principalScope: 'mobile' | 'administrator' | 'signup';
  principalId: string;
  operation: string;
  key: string;
}
export interface ReceiptWrite extends ReceiptKey {
  requestHash: string;
  resultStatus: number;
  resultResourceId?: string;
  resultVersion?: number;
  errorCode?: string;
}
export interface ReceiptRow {
  request_hash: string;
  result_resource_id: string | null;
  result_version: number | null;
  result_status: number;
  error_code: string | null;
}

/** Return the SHA-256 hex digest of a secret or normalized request string; never log/persist the input. */
export function hashSecret(value: string): string { return createHash('sha256').update(value).digest('hex'); }

/** Build a namespaced signed 64-bit PostgreSQL lock key; collisions serialize work but never grant authority. */
function advisoryKey(parts: string[]): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest().readBigInt64BE().toString();
}

/**
 * Try a proof/operation/request-key transaction lock without waiting on identity/proof row locks.
 * Requires an open transaction and a previously verified proof. False is contention, not authentication.
 * The service must re-read proof validity before mapping contention to409; consumed/expired remains401.
 * Returns true only when acquired; propagates DB errors without converting them to contention.
 */
export async function trySignupRequestLock(client: pg.PoolClient, proofId: string, key: string): Promise<boolean> {
  // Valid UUID headers are case-insensitive, just like PostgreSQL uuid equality.
  const result = await client.query<{ locked: boolean }>('SELECT pg_try_advisory_xact_lock($1::bigint) AS locked', [advisoryKey(['signup-request', proofId.toLowerCase(), 'completeSignup', key.toLowerCase()])]);
  return result.rows[0]!.locked;
}

/**
 * Lock identity key, challenge/proof, sorted accounts, sessions, credentials and installations in that order.
 * Uses the caller's transaction client only; IDs are parameters and SQL table names are a fixed local list.
 * Missing rows do not imply permission: services must re-read current state/expiry and check affected rows.
 * A signup request entry lock, when applicable, must already be held. Throws DB errors without swallowing them.
 */
export async function lockIdentityState(client: pg.PoolClient, locks: IdentityLocks): Promise<void> {
  if (locks.identity) await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [advisoryKey(['external-identity', locks.identity.provider, locks.identity.subject])]);
  const rows: [string, string[] | undefined][] = [
    ['login_challenges', locks.challengeId ? [locks.challengeId] : undefined],
    ['signup_proofs', locks.proofId ? [locks.proofId] : undefined],
    ['accounts', locks.accountIds], ['auth_sessions', locks.sessionIds],
    ['refresh_credentials', locks.credentialIds], ['device_installations', locks.deviceIds],
  ];
  for (const [table, ids] of rows) {
    if (ids?.length) await client.query(`SELECT id FROM holdlog.${table} WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE`, [ids]);
  }
}

/**
 * Read completed receipt metadata unexpired at statement time for the exact principal/operation/key.
 * Requires the caller's transaction and authorization/entry lock. No body or token can be reconstructed here.
 * Returns undefined when absent/expired. The service compares request_hash and rechecks current resource access.
 */
export async function readReceipt(client: pg.PoolClient, key: ReceiptKey): Promise<ReceiptRow | undefined> {
  const result = await client.query<ReceiptRow>(`SELECT request_hash, result_resource_id, result_version, result_status, error_code
    FROM holdlog.request_receipts WHERE principal_scope=$1 AND principal_id=$2 AND operation=$3 AND key=$4
    AND state='completed' AND expires_at > statement_timestamp()`, [key.principalScope, key.principalId, key.operation, key.key]);
  return result.rows[0];
}

/**
 * Insert only hashes/result IDs/status with business effects, removing an expired exact-key receipt in the same TX.
 * The DB enforces scope/key uniqueness. Duplicate writes throw23505 and roll back; existing outcomes remain intact.
 * Tokens, provider responses and request bodies are deliberately not accepted as storage fields.
 */
export async function writeReceipt(client: pg.PoolClient, value: ReceiptWrite): Promise<void> {
  await client.query(`DELETE FROM holdlog.request_receipts
    WHERE principal_scope=$1 AND principal_id=$2 AND operation=$3 AND key=$4 AND expires_at <= statement_timestamp()`,
  [value.principalScope, value.principalId, value.operation, value.key]);
  await client.query(`INSERT INTO holdlog.request_receipts
    (principal_scope, principal_id, operation, key, request_hash, state, result_resource_id, result_version, result_status, error_code)
    VALUES ($1,$2,$3,$4,$5,'completed',$6,$7,$8,$9)`,
  [value.principalScope, value.principalId, value.operation, value.key, value.requestHash, value.resultResourceId ?? null, value.resultVersion ?? null, value.resultStatus, value.errorCode ?? null]);
}
