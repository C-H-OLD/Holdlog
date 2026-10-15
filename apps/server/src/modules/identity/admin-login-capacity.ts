import { IdentityError } from './errors.js';
// One API process (docs/architecture/server.md:13) bounds concurrent Argon2 verification with this counter.
const capacity=2;
let inFlight=0;

/**
 * Run password work in one of two process-local slots, outside principal/session business transactions.
 * Reject saturation with retryable503 before hashing; always free the slot. No login/source identifiers are persisted.
 */
export async function withAdminLoginCapacity<T>(work:()=>Promise<T>):Promise<T> {
  if(inFlight>=capacity) throw new IdentityError(503,'TEMPORARY_FAILURE');
  inFlight++;
  try {return await work();}
  finally {inFlight--;}
}
