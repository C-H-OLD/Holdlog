import { createHash, randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { now } from '../../database/time.js';

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

/**
 * Canonicalize a contract-validated UUID to lowercase without the optional urn:uuid: prefix.
 * PostgreSQL uuid compared these spellings equal; SQLite TEXT compares exact characters, so services
 * normalize client UUIDs (challenge, installation, request key) at entry. Format checks stay in the validators.
 */
export function normalizeUuid(value: string): string {
  const lower = value.toLowerCase();
  return lower.startsWith('urn:uuid:') ? lower.slice('urn:uuid:'.length) : lower;
}

/** Map a SQLite 0/1/NULL predicate column to a JavaScript boolean; NULL (unknown) is false. */
function flag(value: number | null): boolean { return value === 1; }

/**
 * Read completed receipt metadata unexpired at statement time for the exact principal/operation/key.
 * Requires the caller's transaction. No body or token can be reconstructed here.
 * Returns undefined when absent/expired. The service compares request_hash and rechecks current resource access.
 */
export function readReceipt(db: Database.Database, key: ReceiptKey): ReceiptRow | undefined {
  return db.prepare<[string, string, string, string], ReceiptRow>(`SELECT request_hash, result_resource_id, result_version, result_status, error_code
    FROM request_receipts WHERE principal_scope=? AND principal_id=? AND operation=? AND "key"=?
    AND state='completed' AND expires_at > ${now()}`).get(key.principalScope, key.principalId, key.operation, key.key);
}

/**
 * Insert only hashes/result IDs/status with business effects, removing an expired exact-key receipt in the same TX.
 * The DB enforces scope/key uniqueness. A duplicate write throws SQLITE_CONSTRAINT_UNIQUE and rolls back; existing outcomes remain intact.
 * Tokens, provider responses and request bodies are deliberately not accepted as storage fields.
 */
export function writeReceipt(db: Database.Database, value: ReceiptWrite): void {
  db.prepare(`DELETE FROM request_receipts
    WHERE principal_scope=? AND principal_id=? AND operation=? AND "key"=? AND expires_at <= ${now()}`)
    .run(value.principalScope, value.principalId, value.operation, value.key);
  db.prepare(`INSERT INTO request_receipts
    (id, principal_scope, principal_id, operation, "key", request_hash, state, result_resource_id, result_version, result_status, error_code)
    VALUES (?,?,?,?,?,?,'completed',?,?,?,?)`)
    .run(randomUUID(), value.principalScope, value.principalId, value.operation, value.key, value.requestHash, value.resultResourceId ?? null, value.resultVersion ?? null, value.resultStatus, value.errorCode ?? null);
}

export interface ChallengeRow { id: string; nonce_hash: string; valid: boolean }
export interface ProofRow { id: string; provider: 'google' | 'apple'; provider_subject: string; email: string | null; device_id: string; valid: boolean }
export interface AccountRow { id: string; display_name: string; profile_image_id: string | null; version: number; provider: 'google' | 'apple'; email: string | null }
export interface SessionRow { id: string; account_id: string; device_id: string | null; token_family_id: string; absolute_expires_at: string; current_refresh_credential_id: string | null; valid: boolean }
export interface RefreshRow extends SessionRow { credential_id: string; used_at: string | null; credential_valid: boolean }
type Flagged<T, K extends keyof T> = Omit<T, K> & { [P in K]: number | null };

/** Fetch challenge validity at the current statement time, independent of the transaction start time. */
export function findChallenge(db: Database.Database, id: string): ChallengeRow | undefined {
  const row = db.prepare<[string], Flagged<ChallengeRow, 'valid'>>(`SELECT id, nonce_hash, consumed_at IS NULL AND expires_at > ${now()} AS valid FROM login_challenges WHERE id=?`).get(id);
  return row && { ...row, valid: flag(row.valid) };
}

/** Persist only a nonce hash and return the id and exact five-minute challenge expiry; the caller owns the transaction. */
export function insertChallenge(db: Database.Database, nonceHash: string): { id: string; expires_at: string } {
  return db.prepare<[string, string], { id: string; expires_at: string }>(`INSERT INTO login_challenges (id, nonce_hash, expires_at) VALUES (?, ?, ${now('+5 minutes')}) RETURNING id, expires_at`).get(randomUUID(), nonceHash)!;
}

/** Fetch proof validity and installation binding; the entry lock and rechecks run in the caller's transaction. */
export function findProof(db: Database.Database, tokenHash: string): ProofRow | undefined {
  const row = db.prepare<[string], Flagged<ProofRow, 'valid'>>(`SELECT id, provider, provider_subject, email, device_id, consumed_at IS NULL AND expires_at > ${now()} AS valid FROM signup_proofs WHERE token_hash=?`).get(tokenHash);
  return row && { ...row, valid: flag(row.valid) };
}

/** Consume a challenge in the same transaction as its single login/proof outcome. */
export function consumeChallenge(db: Database.Database, id: string): void { db.prepare(`UPDATE login_challenges SET consumed_at=${now()} WHERE id=?`).run(id); }

/** Persist a verified identity's limited fifteen-minute proof without creating an account or installation; returns its expiry. */
export function insertProof(db: Database.Database, tokenHash: string, identity: { provider: string; subject: string; email: string | null }, deviceId: string): string {
  return db.prepare<[string, string, string, string, string | null, string], { expires_at: string }>(`INSERT INTO signup_proofs (id, token_hash, provider, provider_subject, email, device_id, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ${now('+15 minutes')}) RETURNING expires_at`).get(randomUUID(), tokenHash, identity.provider, identity.subject, identity.email, deviceId)!.expires_at;
}

/** Resolve an identity exclusively by provider and subject; email never joins accounts. */
export function findIdentity(db: Database.Database, provider: string, subject: string): string | undefined {
  return db.prepare<[string, string], { account_id: string }>('SELECT account_id FROM external_identities WHERE provider=? AND provider_subject=?').get(provider, subject)?.account_id;
}

/** Read the current account projection after authorization; absent rows represent deleted accounts. */
export function findAccount(db: Database.Database, accountId: string): AccountRow | undefined {
  return db.prepare<[string], AccountRow>('SELECT a.id, a.display_name, a.profile_image_id, a.version, i.provider, i.email FROM accounts a JOIN external_identities i ON i.account_id=a.id WHERE a.id=? ORDER BY i.id LIMIT 1').get(accountId);
}

/** Create account and provider identity together and return the account id; unique collisions propagate for rollback/recheck. */
export function insertAccount(db: Database.Database, proof: ProofRow, name: string): string {
  const id = randomUUID();
  db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(id, name);
  db.prepare('INSERT INTO external_identities (id, account_id, provider, provider_subject, email) VALUES (?, ?, ?, ?, ?)').run(randomUUID(), id, proof.provider, proof.provider_subject, proof.email);
  return id;
}

/** Mark a proof consumed; receipt and all business effects share the caller's transaction. */
export function consumeProof(db: Database.Database, id: string): void { db.prepare(`UPDATE signup_proofs SET consumed_at=${now()} WHERE id=?`).run(id); }

/**
 * Insert the installation or replace its ownership, clearing push secrets that belonged to a different account.
 * The caller's IMMEDIATE transaction serializes concurrent inserts of the same installation.
 */
export function connectDevice(db: Database.Database, deviceId: string, accountId: string): void {
  // SQLite evaluates every SET expression against the existing row, so the CASE compares the previous owner.
  db.prepare(`INSERT INTO device_installations (id, account_id) VALUES (?, ?)
    ON CONFLICT (id) DO UPDATE SET account_id=excluded.account_id, last_seen_at=${now()}, version=version+1,
    push_token_ciphertext=CASE WHEN account_id=excluded.account_id THEN push_token_ciphertext ELSE NULL END,
    push_token_hash=CASE WHEN account_id=excluded.account_id THEN push_token_hash ELSE NULL END`).run(deviceId, accountId);
}

/** Map a session row's SQLite predicate to a boolean. */
function session(row: Flagged<SessionRow, 'valid'>): SessionRow { return { ...row, valid: flag(row.valid) }; }

/** Insert a ninety-day family with thirty-day idle expiry; credential rows are inserted before commit. */
export function insertSession(db: Database.Database, accountId: string, family: string): SessionRow {
  return session(db.prepare<[string, string, string], Flagged<SessionRow, 'valid'>>(`INSERT INTO auth_sessions (id, account_id, device_id, token_family_id, expires_at, idle_expires_at, absolute_expires_at)
    VALUES (?, ?, NULL, ?, ${now('+15 minutes')}, ${now('+30 days')}, ${now('+90 days')})
    RETURNING *, 1 AS valid`).get(randomUUID(), accountId, family)!);
}

/** Rotate a session using hashes only; preserve used refresh rows for replay detection until family expiry. Returns both expiries. */
export function insertCredentials(db: Database.Database, session: SessionRow, accessHash: string, refreshHash: string): { access: string; refresh: string } {
  const result = db.prepare<[string], { access: string; refresh: string }>(`UPDATE auth_sessions SET expires_at=min(${now('+15 minutes')}, absolute_expires_at),
    idle_expires_at=min(${now('+30 days')}, absolute_expires_at), rotated_at=${now()} WHERE id=?
    RETURNING expires_at AS access, idle_expires_at AS refresh`).get(session.id)!;
  const credentialId = randomUUID();
  db.prepare('INSERT INTO refresh_credentials (id, session_id, token_family_id, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)').run(credentialId, session.id, session.token_family_id, refreshHash, result.refresh);
  db.prepare('INSERT INTO access_credentials (id, session_id, token_hash, expires_at) VALUES (?, ?, ?, ?)').run(randomUUID(), session.id, accessHash, result.access);
  db.prepare('UPDATE auth_sessions SET current_refresh_credential_id=? WHERE id=?').run(credentialId, session.id);
  return result;
}

/** Look up access credentials and all current account/session/device boundaries at statement time. */
export function findAccess(db: Database.Database, tokenHash: string): SessionRow | undefined {
  const row = db.prepare<[string], Flagged<SessionRow, 'valid'>>(`SELECT s.*, s.revoked_at IS NULL AND c.expires_at > ${now()}
    AND s.idle_expires_at > ${now()} AND s.absolute_expires_at > ${now()}
    AND d.account_id=s.account_id AS valid FROM access_credentials c JOIN auth_sessions s ON s.id=c.session_id
    JOIN accounts a ON a.id=s.account_id LEFT JOIN device_installations d ON d.id=s.device_id WHERE c.token_hash=?`).get(tokenHash);
  return row && session(row);
}

/** Look up refresh rows including used credentials, so replay can revoke the family in a committed transaction. */
export function findRefresh(db: Database.Database, tokenHash: string): RefreshRow | undefined {
  const row = db.prepare<[string], Flagged<RefreshRow, 'valid' | 'credential_valid'>>(`SELECT s.*, c.id AS credential_id, c.used_at,
    s.revoked_at IS NULL AND s.idle_expires_at > ${now()} AND s.absolute_expires_at > ${now()} AND d.account_id=s.account_id AS valid,
    c.revoked_at IS NULL AND c.expires_at > ${now()} AND s.current_refresh_credential_id=c.id AS credential_valid
    FROM refresh_credentials c JOIN auth_sessions s ON s.id=c.session_id JOIN accounts a ON a.id=s.account_id
    LEFT JOIN device_installations d ON d.id=s.device_id WHERE c.token_hash=?`).get(tokenHash);
  return row && { ...row, valid: flag(row.valid), credential_valid: flag(row.credential_valid) };
}

/** Consume the current refresh credential before inserting its successor. */
export function consumeRefresh(db: Database.Database, id: string): void { db.prepare(`UPDATE refresh_credentials SET used_at=${now()} WHERE id=?`).run(id); }

/** Revoke a family and its refresh credentials; callers return denial only after this transaction commits. */
export function revokeSession(db: Database.Database, session: SessionRow): void {
  db.prepare(`UPDATE auth_sessions SET revoked_at=${now()} WHERE token_family_id=?`).run(session.token_family_id);
  db.prepare(`UPDATE refresh_credentials SET revoked_at=${now()} WHERE token_family_id=?`).run(session.token_family_id);
}

/** Detach only the still-current account binding, preserving a newer different-account login. */
export function disconnectDevice(db: Database.Database, session: SessionRow): void {
  if (!session.device_id) return;
  db.prepare(`UPDATE device_installations SET account_id=NULL, push_token_hash=NULL, push_token_ciphertext=NULL, version=version+1
    WHERE id=? AND account_id=?`).run(session.device_id, session.account_id);
}

/** Update only the name and optimistic version; image lifecycle remains owned by 011. */
export function updateName(db: Database.Database, accountId: string, name: string): void {
  db.prepare(`UPDATE accounts SET display_name=?, version=version+1, updated_at=${now()} WHERE id=?`).run(name, accountId);
}

/** Delete expired/consumed proofs in a bounded batch of 500 and return the count; receipts stay independent. */
export function deleteStaleProofs(db: Database.Database): number {
  return db.prepare(`DELETE FROM signup_proofs WHERE id IN (SELECT id FROM signup_proofs
    WHERE expires_at <= ${now()} OR consumed_at IS NOT NULL ORDER BY id LIMIT 500)`).run().changes;
}

/** Attach a newly inserted family to its installation after credentials and installation are stored. */
export function attachSessionDevice(db: Database.Database, sessionId: string, deviceId: string): void {
  db.prepare('UPDATE auth_sessions SET device_id=? WHERE id=?').run(deviceId, sessionId);
}
