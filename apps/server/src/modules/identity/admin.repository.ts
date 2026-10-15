import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { at, now } from '../../database/time.js';
export interface AdministratorRow {id:string;login_id:string;credential_hash:string;active:boolean;version:number}
export interface AdminSessionRow {id:string;administrator_id:string;csrf_token_hash:string;expires_at:string;valid:boolean;effective_expiry:string}
const idleExpiry=at('last_activity_at','+30 minutes');

/** Look up only the separate service principal; mobile/crew identities never participate. active is mapped from 0/1. */
export function findAdministrator(db:Database.Database,loginId:string):AdministratorRow|undefined {
  const row=db.prepare<[string],Omit<AdministratorRow,'active'>&{active:number}>('SELECT id,login_id,credential_hash,active,version FROM service_administrators WHERE login_id=?').get(loginId);
  return row&&{...row,active:row.active===1};
}

/** Insert a create-only active principal; a login_id collision propagates without overwriting existing credentials. */
export function createAdministrator(db:Database.Database,loginId:string,digest:string):{id:string;version:number} {
  return db.prepare<[string,string,string],{id:string;version:number}>('INSERT INTO service_administrators(id,login_id,credential_hash,active) VALUES (?,?,?,1) RETURNING id,version').get(randomUUID(),loginId,digest)!;
}

/** Replace only credentials/version and revoke every existing session in the caller's transaction; returns the new version. */
export function replaceAdministratorPassword(db:Database.Database,id:string,digest:string):number {
  const row=db.prepare<[string,string],{version:number}>('UPDATE service_administrators SET credential_hash=?,version=version+1 WHERE id=? RETURNING version').get(digest,id)!;
  db.prepare(`UPDATE admin_sessions SET revoked_at=${now()} WHERE administrator_id=? AND revoked_at IS NULL`).run(id);
  return row.version;
}

/** Insert only cookie/CSRF hashes with an eight-hour absolute lifetime and return it; no response body is persisted. */
export function createAdminSession(db:Database.Database,id:string,principalId:string,secretHash:string,csrfHash:string):string {
  return db.prepare<[string,string,string,string],{expires_at:string}>(`INSERT INTO admin_sessions(id,administrator_id,session_secret_hash,csrf_token_hash,expires_at) VALUES (?,?,?,?,${now('+8 hours')}) RETURNING expires_at`).get(id,principalId,secretHash,csrfHash)!.expires_at;
}

/** Read current principal/session state with statement-time idle and absolute expiry checks. */
export function findAdminSession(db:Database.Database,secretHash:string):AdminSessionRow|undefined {
  const row=db.prepare<[string],Omit<AdminSessionRow,'valid'>&{valid:number|null}>(`SELECT s.id,s.administrator_id,s.csrf_token_hash,s.expires_at,
    a.active=1 AND s.revoked_at IS NULL AND s.expires_at>${now()} AND ${at('s.last_activity_at','+30 minutes')}>${now()} AS valid,
    min(s.expires_at,${at('s.last_activity_at','+30 minutes')}) AS effective_expiry
    FROM admin_sessions s JOIN service_administrators a ON a.id=s.administrator_id WHERE s.session_secret_hash=?`).get(secretHash);
  return row&&{...row,valid:row.valid===1};
}

/** Advance idle activity after authorization and return the cap at the unchanged absolute expiry. */
export function touchAdminSession(db:Database.Database,id:string):string {
  return db.prepare<[string],{effective_expiry:string}>(`UPDATE admin_sessions SET last_activity_at=${now()} WHERE id=? RETURNING min(expires_at,${idleExpiry}) AS effective_expiry`).get(id)!.effective_expiry;
}

/** Revoke one session without changing the principal or any mobile/crew data. */
export function revokeAdminSession(db:Database.Database,id:string):void { db.prepare(`UPDATE admin_sessions SET revoked_at=${now()} WHERE id=?`).run(id); }
