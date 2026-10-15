import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { components } from '@holdlog/contracts/http';
import type { IdentityConfiguration } from '../../config/environment.js';
import { asPromise, withTransaction, type SyncResult } from '../../database/transaction.js';
import { administratorPasswords, type PasswordCodec } from './admin-credentials.js';
import { withAdminLoginCapacity } from './admin-login-capacity.js';
import * as repository from './admin.repository.js';
import { hashSecret } from './identity.repository.js';
import { IdentityError, unauthenticated } from './errors.js';
type AdminSession=components['schemas']['AdminSession'];

/** Derive a stable CSRF token from the opaque cookie, session identity and independent server key. */
function csrfToken(key:Buffer,id:string,secret:string):string {return createHmac('sha256',key).update(JSON.stringify(['holdlog-admin-csrf',id,secret])).digest('hex');}

/** Authenticate separate service principals and run cookie-session work in IMMEDIATE transactions. */
export class AdminSessionService {
  private dummyDigest:Promise<string>|undefined;
  /** Inject the API connection and only administrator settings; Google/Apple configuration is unnecessary for this service. */
  constructor(private readonly db:Database.Database,private readonly config:IdentityConfiguration['admin'],private readonly passwords:PasswordCodec=administratorPasswords) {}

  /** Reject missing, null, noncanonical or foreign Origins using the configured exact HTTPS allowlist. */
  requireOrigin(origin:string|undefined):void {if(!origin||!this.config.allowedOrigins.includes(origin)) throw new IdentityError(403,'FORBIDDEN');}

  /**
   * Verify credentials outside the transaction, then recheck the current hash/version/active state before issuing a session.
   * Returns the cookie secret, the absolute expiry (UTC ISO) for the cookie attributes and the public session.
   */
  async login(input:components['schemas']['AdminLoginInput'],origin:string|undefined):Promise<{cookie:string;absoluteExpiresAt:string;session:AdminSession}> {
    this.requireOrigin(origin);
    const principal=await withAdminLoginCapacity(async()=>{
      const found=repository.findAdministrator(this.db,input.loginId);
      // Unknown/inactive identifiers must not skip the costly verification path.
      if(!found&&!this.dummyDigest) this.dummyDigest=this.passwords.hash(randomBytes(32).toString('hex')).catch((error:unknown)=>{this.dummyDigest=undefined;throw error;});
      const digest=found?.credential_hash??await this.dummyDigest!;
      const valid=await this.passwords.verify(digest,input.password);
      if(!found?.active||!valid) throw unauthenticated();
      return found;
    });
    return withTransaction(this.db,()=>{
      const current=repository.findAdministrator(this.db,input.loginId);
      if(!current?.active||current.version!==principal.version||current.credential_hash!==principal.credential_hash) throw unauthenticated();
      const cookie=randomBytes(32).toString('hex'),id=randomUUID(),csrf=csrfToken(this.config.csrfKey,id,cookie);
      const absoluteExpiresAt=repository.createAdminSession(this.db,id,principal.id,hashSecret(cookie),hashSecret(csrf));
      const expiresAt=repository.touchAdminSession(this.db,id);
      return {cookie,absoluteExpiresAt,session:{principalId:principal.id,csrfToken:csrf,expiresAt}};
    });
  }

  /** Recheck current cookie/CSRF authority inside the caller's transaction; never accept mobile Bearer credentials or principal IDs. */
  private authorize(cookie:string,origin?:string,csrf?:string):{row:repository.AdminSessionRow;csrf:string} {
    if(!/^[a-f0-9]{64}$/.test(cookie)) throw unauthenticated();
    const hash=hashSecret(cookie),found=repository.findAdminSession(this.db,hash); if(!found?.valid) throw unauthenticated();
    // The IMMEDIATE transaction replaced the principal/session row locks; the re-read keeps the former recheck order.
    const row=repository.findAdminSession(this.db,hash); if(!row?.valid) throw unauthenticated();
    const token=csrfToken(this.config.csrfKey,row.id,cookie);
    if(!timingSafeEqual(Buffer.from(hashSecret(token)),Buffer.from(row.csrf_token_hash))) throw unauthenticated();
    if(origin!==undefined||csrf!==undefined) {
      this.requireOrigin(origin);
      if(!csrf||!timingSafeEqual(Buffer.from(hashSecret(csrf)),Buffer.from(row.csrf_token_hash))) throw new IdentityError(403,'FORBIDDEN');
    }
    return {row,csrf:token};
  }

  /** Reconstruct CSRF and refresh idle activity for an authorized session without exposing the cookie in JSON. */
  session(cookie:string):Promise<AdminSession> {
    return asPromise(()=>withTransaction(this.db,()=>{const {row,csrf}=this.authorize(cookie);const expiresAt=repository.touchAdminSession(this.db,row.id);return {principalId:row.administrator_id,csrfToken:csrf,expiresAt};}));
  }

  /**
   * Run protected business work in the same IMMEDIATE transaction as current authority and idle activity.
   * A write requires exact Origin/CSRF; a thrown callback error rolls back all work. work is synchronous
   * (a Promise result is a type error), must use the given connection and never commit itself.
   */
  withAdministrator<T extends SyncResult>(cookie:string,write:{origin:string|undefined;csrf:string|undefined}|undefined,work:(db:Database.Database,principal:{principalId:string;sessionId:string})=>T):Promise<T> {
    return asPromise(()=>withTransaction(this.db,()=>{
      if(write) this.requireOrigin(write.origin);
      const {row}=this.authorize(cookie,write?.origin,write?.csrf);
      repository.touchAdminSession(this.db,row.id);
      return work(this.db,{principalId:row.administrator_id,sessionId:row.id});
    }));
  }

  /** Authorize downstream read/write guards, checking Origin and CSRF on every non-read request. */
  authenticate(cookie:string,write=false,origin?:string,csrf?:string):Promise<{principalId:string;sessionId:string}> {
    return this.withAdministrator(cookie,write?{origin,csrf}:undefined,(_db,principal)=>principal);
  }

  /** Revoke this session only after cookie, exact Origin and session-bound CSRF validation; DB failures roll back. */
  logout(cookie:string,origin:string|undefined,csrf:string|undefined):Promise<Record<string,never>> {
    return asPromise(()=>{
      this.requireOrigin(origin);
      return withTransaction(this.db,()=>{const {row}=this.authorize(cookie,origin,csrf);repository.revokeAdminSession(this.db,row.id);return {};});
    });
  }
}
