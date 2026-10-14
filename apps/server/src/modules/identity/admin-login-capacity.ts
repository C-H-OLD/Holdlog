import type pg from 'pg';
import { IdentityError } from './errors.js';
// Bound each process before connecting; PostgreSQL's two shared slots also bound multiple API instances.
const capacity=2;
let inFlight=0;

/**
 * Run password work in one of two shared advisory slots, outside principal/session business transactions.
 * Reject saturation with retryable503 before hashing. Always unlock/release, discarding a connection whose
 * unlock fails so session locks cannot leak to another request. No login/source identifiers are persisted.
 */
export async function withAdminLoginCapacity<T>(pool:pg.Pool,work:(client:pg.PoolClient)=>Promise<T>):Promise<T> {
  if(inFlight>=capacity) throw new IdentityError(503,'TEMPORARY_FAILURE');
  inFlight++;let client:pg.PoolClient|undefined,slot:number|undefined,discard=false;
  try {
    client=await pool.connect();
    for(let candidate=0;candidate<capacity;candidate++) {
      const result=await client.query<{acquired:boolean}>("SELECT pg_try_advisory_lock(hashtext('holdlog.admin.password-verification'),$1) AS acquired",[candidate]);
      if(result.rows[0]?.acquired){slot=candidate;break;}
    }
    if(slot===undefined) throw new IdentityError(503,'TEMPORARY_FAILURE');
    return await work(client);
  } finally {
    if(client&&slot!==undefined) {
      try {discard=!(await client.query<{released:boolean}>("SELECT pg_advisory_unlock(hashtext('holdlog.admin.password-verification'),$1) AS released",[slot])).rows[0]?.released;}
      catch {discard=true;}
    }
    try {client?.release(discard);} finally {inFlight--;}
  }
}
