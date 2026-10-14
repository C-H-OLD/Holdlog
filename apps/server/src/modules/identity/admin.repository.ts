import type pg from 'pg';
export interface AdministratorRow {id:string;login_id:string;credential_hash:string;active:boolean;version:number}
export interface AdminSessionRow {id:string;administrator_id:string;csrf_token_hash:string;expires_at:Date;valid:boolean;effective_expiry:Date}

/** Look up only the separate service principal; mobile/crew identities never participate. */
export async function findAdministrator(client:pg.Pool|pg.PoolClient,loginId:string):Promise<AdministratorRow|undefined> {
  return (await client.query<AdministratorRow>('SELECT id,login_id,credential_hash,active,version FROM holdlog.service_administrators WHERE login_id=$1',[loginId])).rows[0];
}

/** Lock a principal before its sessions, matching password replacement and protected request order. */
export async function lockAdministrator(client:pg.PoolClient,id:string,sessionId?:string):Promise<void> {
  await client.query('SELECT id FROM holdlog.service_administrators WHERE id=$1 FOR UPDATE',[id]);
  if (sessionId) await client.query('SELECT id FROM holdlog.admin_sessions WHERE id=$1 ORDER BY id FOR UPDATE',[sessionId]);
}

/** Insert a create-only active principal; unique collision propagates without overwriting existing credentials. */
export async function createAdministrator(client:pg.PoolClient,loginId:string,digest:string):Promise<{id:string;version:number}> {
  return (await client.query<{id:string;version:number}>('INSERT INTO holdlog.service_administrators(login_id,credential_hash,active) VALUES ($1,$2,true) RETURNING id,version',[loginId,digest])).rows[0]!;
}

/** Replace only credentials/version and revoke every existing session on the same caller-owned transaction. */
export async function replaceAdministratorPassword(client:pg.PoolClient,id:string,digest:string):Promise<number> {
  await client.query('SELECT id FROM holdlog.admin_sessions WHERE administrator_id=$1 ORDER BY id FOR UPDATE',[id]);
  const row=(await client.query<{version:number}>('UPDATE holdlog.service_administrators SET credential_hash=$2,version=version+1 WHERE id=$1 RETURNING version',[id,digest])).rows[0]!;
  await client.query('UPDATE holdlog.admin_sessions SET revoked_at=statement_timestamp() WHERE administrator_id=$1 AND revoked_at IS NULL',[id]);
  return row.version;
}

/** Insert only cookie/CSRF hashes with an eight-hour absolute lifetime; no response body is persisted. */
export async function createAdminSession(client:pg.PoolClient,id:string,principalId:string,secretHash:string,csrfHash:string):Promise<Date> {
  return (await client.query<{expires_at:Date}>("INSERT INTO holdlog.admin_sessions(id,administrator_id,session_secret_hash,csrf_token_hash,expires_at) VALUES ($1,$2,$3,$4,statement_timestamp()+interval '8 hours') RETURNING expires_at",[id,principalId,secretHash,csrfHash])).rows[0]!.expires_at;
}

/** Read current principal/session state with statement-time idle and absolute expiry checks. */
export async function findAdminSession(client:pg.PoolClient,secretHash:string):Promise<AdminSessionRow|undefined> {
  return (await client.query<AdminSessionRow>(`SELECT s.id,s.administrator_id,s.csrf_token_hash,s.expires_at,
    a.active AND s.revoked_at IS NULL AND s.expires_at>statement_timestamp() AND s.last_activity_at+interval '30 minutes'>statement_timestamp() AS valid,
    LEAST(s.expires_at,s.last_activity_at+interval '30 minutes') AS effective_expiry
    FROM holdlog.admin_sessions s JOIN holdlog.service_administrators a ON a.id=s.administrator_id WHERE s.session_secret_hash=$1`,[secretHash])).rows[0];
}

/** Advance idle activity after authorization and return the cap at the unchanged absolute expiry. */
export async function touchAdminSession(client:pg.PoolClient,id:string):Promise<Date> {
  return (await client.query<{effective_expiry:Date}>("UPDATE holdlog.admin_sessions SET last_activity_at=statement_timestamp() WHERE id=$1 RETURNING LEAST(expires_at,last_activity_at+interval '30 minutes') AS effective_expiry",[id])).rows[0]!.effective_expiry;
}

/** Revoke one locked session without changing the principal or any mobile/crew data. */
export async function revokeAdminSession(client:pg.PoolClient,id:string):Promise<void> { await client.query('UPDATE holdlog.admin_sessions SET revoked_at=statement_timestamp() WHERE id=$1',[id]); }
