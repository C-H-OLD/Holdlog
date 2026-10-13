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

export interface ChallengeRow { id: string; nonce_hash: string; valid: boolean }
export interface ProofRow { id: string; provider: 'google' | 'apple'; provider_subject: string; email: string | null; device_id: string; valid: boolean }
export interface AccountRow { id: string; display_name: string; profile_image_id: string | null; version: number; provider: 'google' | 'apple'; email: string | null }
export interface SessionRow { id: string; account_id: string; device_id: string | null; token_family_id: string; absolute_expires_at: Date; current_refresh_credential_id: string | null; valid: boolean }
export interface RefreshRow extends SessionRow { credential_id: string; used_at: Date | null; credential_valid: boolean }

/** Fetch challenge validity at current statement time, independent of the transaction start time. */
export async function findChallenge(client: pg.Pool | pg.PoolClient, id: string): Promise<ChallengeRow | undefined> {
  return (await client.query<ChallengeRow>('SELECT id,nonce_hash,consumed_at IS NULL AND expires_at>statement_timestamp() AS valid FROM holdlog.login_challenges WHERE id=$1', [id])).rows[0];
}

/** Persist only a nonce hash and return the exact five-minute challenge expiry. */
export async function insertChallenge(client: pg.Pool, nonceHash: string): Promise<{ id: string; expires_at: Date }> {
  return (await client.query<{ id: string; expires_at: Date }>("INSERT INTO holdlog.login_challenges(nonce_hash,expires_at) VALUES ($1,statement_timestamp()+interval '5 minutes') RETURNING id,expires_at", [nonceHash])).rows[0]!;
}

/** Fetch proof validity and installation binding without row locks for the nonblocking entry gate. */
export async function findProof(client: pg.PoolClient, tokenHash: string): Promise<ProofRow | undefined> {
  return (await client.query<ProofRow>('SELECT id,provider,provider_subject,email,device_id,consumed_at IS NULL AND expires_at>statement_timestamp() AS valid FROM holdlog.signup_proofs WHERE token_hash=$1', [tokenHash])).rows[0];
}

/** Consume a challenge in the same transaction as its single login/proof outcome. */
export async function consumeChallenge(client: pg.PoolClient, id: string): Promise<void> { await client.query('UPDATE holdlog.login_challenges SET consumed_at=statement_timestamp() WHERE id=$1', [id]); }

/** Persist a verified identity's limited fifteen-minute proof, without creating an account or installation. */
export async function insertProof(client: pg.PoolClient, tokenHash: string, identity: { provider: string; subject: string; email: string | null }, deviceId: string): Promise<Date> {
  return (await client.query<{ expires_at: Date }>("INSERT INTO holdlog.signup_proofs(token_hash,provider,provider_subject,email,device_id,expires_at) VALUES ($1,$2,$3,$4,$5,statement_timestamp()+interval '15 minutes') RETURNING expires_at", [tokenHash, identity.provider, identity.subject, identity.email, deviceId])).rows[0]!.expires_at;
}

/** Resolve an identity exclusively by provider and subject; email never joins accounts. */
export async function findIdentity(client: pg.PoolClient, provider: string, subject: string): Promise<string | undefined> {
  return (await client.query<{ account_id: string }>('SELECT account_id FROM holdlog.external_identities WHERE provider=$1 AND provider_subject=$2', [provider, subject])).rows[0]?.account_id;
}

/** Read the current account projection after authorization; absent rows represent deleted accounts. */
export async function findAccount(client: pg.PoolClient, accountId: string): Promise<AccountRow | undefined> {
  return (await client.query<AccountRow>('SELECT a.id,a.display_name,a.profile_image_id,a.version,i.provider,i.email FROM holdlog.accounts a JOIN holdlog.external_identities i ON i.account_id=a.id WHERE a.id=$1 ORDER BY i.id LIMIT 1', [accountId])).rows[0];
}

/** Create account and provider identity together; unique collisions propagate for rollback/recheck. */
export async function insertAccount(client: pg.PoolClient, proof: ProofRow, name: string): Promise<string> {
  const id = (await client.query<{ id: string }>('INSERT INTO holdlog.accounts(display_name) VALUES ($1) RETURNING id', [name])).rows[0]!.id;
  await client.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject,email) VALUES ($1,$2,$3,$4)', [id, proof.provider, proof.provider_subject, proof.email]);
  return id;
}

/** Mark a locked proof consumed; receipt and all business effects share the caller's transaction. */
export async function consumeProof(client: pg.PoolClient, id: string): Promise<void> { await client.query('UPDATE holdlog.signup_proofs SET consumed_at=statement_timestamp() WHERE id=$1', [id]); }

/** Serialize installation inserts across accounts, then replace ownership and clear prior-account push secrets. */
export async function connectDevice(client: pg.PoolClient, deviceId: string, accountId: string): Promise<void> {
  await lockDevice(client, deviceId);
  await client.query(`INSERT INTO holdlog.device_installations(id,account_id) VALUES ($1,$2)
    ON CONFLICT(id) DO UPDATE SET account_id=excluded.account_id,last_seen_at=statement_timestamp(),version=device_installations.version+1,
    push_token_ciphertext=CASE WHEN device_installations.account_id=excluded.account_id THEN device_installations.push_token_ciphertext ELSE NULL END,
    push_token_hash=CASE WHEN device_installations.account_id=excluded.account_id THEN device_installations.push_token_hash ELSE NULL END`, [deviceId, accountId]);
}

/** Insert a ninety-day family with thirty-day idle expiry; credential rows are inserted before commit. */
export async function insertSession(client: pg.PoolClient, accountId: string, family: string): Promise<SessionRow> {
  return (await client.query<SessionRow>(`INSERT INTO holdlog.auth_sessions(account_id,device_id,token_family_id,expires_at,idle_expires_at,absolute_expires_at)
    VALUES ($1,NULL,$2,statement_timestamp()+interval '15 minutes',statement_timestamp()+interval '30 days',statement_timestamp()+interval '90 days')
    RETURNING *,true AS valid`, [accountId, family])).rows[0]!;
}

/** Rotate a session using hashes only; preserve used refresh rows for replay detection until family expiry. */
export async function insertCredentials(client: pg.PoolClient, session: SessionRow, accessHash: string, refreshHash: string): Promise<{ access: Date; refresh: Date }> {
  const result = (await client.query<{ access: Date; refresh: Date }>(`UPDATE holdlog.auth_sessions SET expires_at=LEAST(statement_timestamp()+interval '15 minutes',absolute_expires_at),
    idle_expires_at=LEAST(statement_timestamp()+interval '30 days',absolute_expires_at),rotated_at=statement_timestamp() WHERE id=$1
    RETURNING expires_at AS access,idle_expires_at AS refresh`, [session.id])).rows[0]!;
  const credential = (await client.query<{ id: string }>('INSERT INTO holdlog.refresh_credentials(session_id,token_family_id,token_hash,expires_at) VALUES ($1,$2,$3,$4) RETURNING id', [session.id, session.token_family_id, refreshHash, result.refresh])).rows[0]!;
  await client.query('INSERT INTO holdlog.access_credentials(session_id,token_hash,expires_at) VALUES ($1,$2,$3)', [session.id, accessHash, result.access]);
  await client.query('UPDATE holdlog.auth_sessions SET current_refresh_credential_id=$2 WHERE id=$1', [session.id, credential.id]);
  return result;
}

/** Lookup access credentials and all current account/session/device boundaries at statement time. */
export async function findAccess(client: pg.PoolClient, tokenHash: string): Promise<SessionRow | undefined> {
  return (await client.query<SessionRow>(`SELECT s.*,s.revoked_at IS NULL AND c.expires_at>statement_timestamp()
    AND s.idle_expires_at>statement_timestamp() AND s.absolute_expires_at>statement_timestamp()
    AND d.account_id=s.account_id AS valid FROM holdlog.access_credentials c JOIN holdlog.auth_sessions s ON s.id=c.session_id
    JOIN holdlog.accounts a ON a.id=s.account_id LEFT JOIN holdlog.device_installations d ON d.id=s.device_id WHERE c.token_hash=$1`, [tokenHash])).rows[0];
}

/** Lookup refresh rows including used credentials, so replay can revoke the family in a committed transaction. */
export async function findRefresh(client: pg.PoolClient, tokenHash: string): Promise<RefreshRow | undefined> {
  return (await client.query<RefreshRow>(`SELECT s.*,c.id AS credential_id,c.used_at,
    s.revoked_at IS NULL AND s.idle_expires_at>statement_timestamp() AND s.absolute_expires_at>statement_timestamp() AND d.account_id=s.account_id AS valid,
    c.revoked_at IS NULL AND c.expires_at>statement_timestamp() AND s.current_refresh_credential_id=c.id AS credential_valid
    FROM holdlog.refresh_credentials c JOIN holdlog.auth_sessions s ON s.id=c.session_id JOIN holdlog.accounts a ON a.id=s.account_id
    LEFT JOIN holdlog.device_installations d ON d.id=s.device_id WHERE c.token_hash=$1`, [tokenHash])).rows[0];
}

/** Consume the locked current refresh credential before inserting its successor. */
export async function consumeRefresh(client: pg.PoolClient, id: string): Promise<void> { await client.query('UPDATE holdlog.refresh_credentials SET used_at=statement_timestamp() WHERE id=$1', [id]); }

/** Revoke a family and its refresh credentials; callers return denial only after this transaction commits. */
export async function revokeSession(client: pg.PoolClient, session: SessionRow): Promise<void> {
  await client.query('UPDATE holdlog.auth_sessions SET revoked_at=statement_timestamp() WHERE token_family_id=$1', [session.token_family_id]);
  await client.query('UPDATE holdlog.refresh_credentials SET revoked_at=statement_timestamp() WHERE token_family_id=$1', [session.token_family_id]);
}

/** Detach only the still-current account binding, preserving a newer different-account login. */
export async function disconnectDevice(client: pg.PoolClient, session: SessionRow): Promise<void> {
  if (!session.device_id) return;
  await lockDevice(client, session.device_id);
  await client.query(`UPDATE holdlog.device_installations SET account_id=NULL,push_token_hash=NULL,push_token_ciphertext=NULL,version=version+1
    WHERE id=$1 AND account_id=$2`, [session.device_id, session.account_id]);
}

/** Update only the name and optimistic version; image lifecycle remains owned by 011. */
export async function updateName(client: pg.PoolClient, accountId: string, name: string): Promise<void> {
  await client.query('UPDATE holdlog.accounts SET display_name=$2,version=version+1,updated_at=statement_timestamp() WHERE id=$1', [accountId, name]);
}

/** Delete expired/consumed proofs in bounded batches, skipping in-flight row locks; keep receipts independent. */
export async function deleteStaleProofs(client: pg.PoolClient): Promise<number> {
  return (await client.query(`DELETE FROM holdlog.signup_proofs WHERE id IN (SELECT id FROM holdlog.signup_proofs
    WHERE expires_at<=statement_timestamp() OR consumed_at IS NOT NULL ORDER BY id LIMIT 500 FOR UPDATE SKIP LOCKED)`)).rowCount ?? 0;
}

/** Lock the installation after session/credentials, including absent-row insert races across different accounts. */
export async function lockDevice(client: pg.PoolClient, deviceId: string): Promise<void> {
  await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [advisoryKey(['device', deviceId.toLowerCase()])]);
  await client.query('SELECT id FROM holdlog.device_installations WHERE id=$1 FOR UPDATE', [deviceId]);
}

/** Attach a newly inserted family only after credentials and installation have been stored in lock order. */
export async function attachSessionDevice(client: pg.PoolClient, sessionId: string, deviceId: string): Promise<void> {
  await client.query('UPDATE holdlog.auth_sessions SET device_id=$2 WHERE id=$1', [sessionId, deviceId]);
}
