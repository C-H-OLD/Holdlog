import { randomBytes, randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { components } from '@holdlog/contracts/http';
import * as repository from './identity.repository.js';
import { unauthenticated } from './errors.js';
export type MobileSession = components['schemas']['MobileSession'];
export type Profile = components['schemas']['Profile'];

/** Generate a fresh 256-bit opaque secret; callers persist its SHA-256 digest only. */
export function secret(): string { return randomBytes(32).toString('hex'); }

/** Read a current authorized account's public self projection; deleted accounts fail closed. */
export function profile(db: Database.Database, accountId: string): Profile {
  const account = repository.findAccount(db, accountId);
  if (!account) throw unauthenticated();
  return { id: account.id, name: account.display_name, photoFileId: account.profile_image_id, version: account.version, identity: { provider: account.provider, email: account.email } };
}

/** Issue fresh token hashes within the caller's transaction, returning secrets only to the immediate caller. */
export function issueCredentials(db: Database.Database, session: repository.SessionRow): MobileSession {
  const accessToken = secret(), refreshToken = secret();
  const expiry = repository.insertCredentials(db, session, repository.hashSecret(accessToken), repository.hashSecret(refreshToken));
  return { accessToken, refreshToken, accessExpiresAt: expiry.access, refreshExpiresAt: expiry.refresh, profile: profile(db, session.account_id) };
}

/** Connect the installation and create a fresh family atomically after account authorization. */
export function issueSession(db: Database.Database, accountId: string, deviceId: string): MobileSession {
  const session = repository.insertSession(db, accountId, randomUUID());
  const result = issueCredentials(db, session);
  repository.connectDevice(db, deviceId, accountId);
  repository.attachSessionDevice(db, session.id, deviceId);
  return result;
}

/**
 * Re-read access authorization inside the caller's IMMEDIATE transaction so deletion/revocation committed
 * before it cannot authorize a write. The second read keeps the former lock-then-recheck order: time can pass
 * between statements, so an access expiry on the boundary is checked again.
 */
export function authorize(db: Database.Database, token: string): repository.SessionRow {
  const hash = repository.hashSecret(token), found = repository.findAccess(db, hash);
  if (!found?.valid) throw unauthenticated();
  const current = repository.findAccess(db, hash);
  if (!current?.valid) throw unauthenticated();
  return current;
}
