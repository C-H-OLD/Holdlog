import { randomBytes, randomUUID } from 'node:crypto';
import type pg from 'pg';
import type { components } from '@holdlog/contracts/http';
import * as repository from './identity.repository.js';
import { unauthenticated } from './errors.js';
export type MobileSession = components['schemas']['MobileSession'];
export type Profile = components['schemas']['Profile'];

/** Generate a fresh 256-bit opaque secret; callers persist its SHA-256 digest only. */
export function secret(): string { return randomBytes(32).toString('hex'); }

/** Read a current authorized account's public self projection; deleted accounts fail closed. */
export async function profile(client: pg.PoolClient, accountId: string): Promise<Profile> {
  const account = await repository.findAccount(client, accountId);
  if (!account) throw unauthenticated();
  return { id: account.id, name: account.display_name, photoFileId: account.profile_image_id, version: account.version, identity: { provider: account.provider, email: account.email } };
}

/** Issue fresh token hashes within the caller's locked transaction, returning secrets only to the immediate caller. */
export async function issueCredentials(client: pg.PoolClient, session: repository.SessionRow): Promise<MobileSession> {
  const accessToken = secret(), refreshToken = secret();
  const expiry = await repository.insertCredentials(client, session, repository.hashSecret(accessToken), repository.hashSecret(refreshToken));
  return { accessToken, refreshToken, accessExpiresAt: expiry.access.toISOString(), refreshExpiresAt: expiry.refresh.toISOString(), profile: await profile(client, session.account_id) };
}

/** Connect the installation and create a fresh family atomically after account authorization and locking. */
export async function issueSession(client: pg.PoolClient, accountId: string, deviceId: string): Promise<MobileSession> {
  const session = await repository.insertSession(client, accountId, randomUUID());
  const result = await issueCredentials(client, session);
  await repository.connectDevice(client, deviceId, accountId);
  await repository.attachSessionDevice(client, session.id, deviceId);
  return result;
}

/** Re-read access authorization under account/session locks so concurrent deletion/revocation cannot authorize a write. */
export async function authorize(client: pg.PoolClient, token: string): Promise<repository.SessionRow> {
  const hash = repository.hashSecret(token), found = await repository.findAccess(client, hash);
  if (!found?.valid) throw unauthenticated();
  await repository.lockIdentityState(client, { accountIds: [found.account_id], sessionIds: [found.id], ...(found.current_refresh_credential_id ? { credentialIds: [found.current_refresh_credential_id] } : {}) });
  if (found.device_id) await repository.lockDevice(client, found.device_id);
  const current = await repository.findAccess(client, hash);
  if (!current?.valid) throw unauthenticated();
  return current;
}
