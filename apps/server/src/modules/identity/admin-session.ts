import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type pg from 'pg';
import type { components } from '@holdlog/contracts/http';
import type { IdentityConfiguration } from '../../config/environment.js';
import { withTransaction } from '../../database/transaction.js';
import { administratorPasswords, type PasswordCodec } from './admin-credentials.js';
import { withAdminLoginCapacity } from './admin-login-capacity.js';
import * as repository from './admin.repository.js';
import { hashSecret } from './identity.repository.js';
import { IdentityError, unauthenticated } from './errors.js';
type AdminSession=components['schemas']['AdminSession'];

/** Derive a stable CSRF token from the opaque cookie, session identity and independent server key. */
function csrfToken(key:Buffer,id:string,secret:string):string {return createHmac('sha256',key).update(JSON.stringify(['holdlog-admin-csrf',id,secret])).digest('hex');}

/** Authenticate separate service principals and coordinate cookie sessions on principal→session locks. */
export class AdminSessionService {
  private dummyDigest:Promise<string>|undefined;
  /** Inject only administrator settings; Google/Apple configuration is unnecessary for this service. */
  constructor(private readonly pool:pg.Pool,private readonly config:IdentityConfiguration['admin'],private readonly passwords:PasswordCodec=administratorPasswords) {}

  /** Reject missing, null, noncanonical or foreign Origins using the configured exact HTTPS allowlist. */
  requireOrigin(origin:string|undefined):void {if(!origin||!this.config.allowedOrigins.includes(origin)) throw new IdentityError(403,'FORBIDDEN');}

  /** Verify credentials outside SQL locks, then recheck the current hash/version/active state before issuing a session. */
  async login(input:components['schemas']['AdminLoginInput'],origin:string|undefined):Promise<{cookie:string;absoluteExpiresAt:Date;session:AdminSession}> {
    this.requireOrigin(origin);
    const principal=await withAdminLoginCapacity(this.pool,async client=>{
      const found=await repository.findAdministrator(client,input.loginId);
      // Unknown/inactive identifiers must not skip the costly verification path.
      if(!found&&!this.dummyDigest) this.dummyDigest=this.passwords.hash(randomBytes(32).toString('hex')).catch((error:unknown)=>{this.dummyDigest=undefined;throw error;});
      const digest=found?.credential_hash??await this.dummyDigest!;
      const valid=await this.passwords.verify(digest,input.password);
      if(!found?.active||!valid) throw unauthenticated();
      return found;
    });
    return withTransaction(this.pool,async client=>{
      await repository.lockAdministrator(client,principal.id);
      const current=await repository.findAdministrator(client,input.loginId);
      if(!current?.active||current.version!==principal.version||current.credential_hash!==principal.credential_hash) throw unauthenticated();
      const cookie=randomBytes(32).toString('hex'),id=randomUUID(),csrf=csrfToken(this.config.csrfKey,id,cookie);
      const absoluteExpiresAt=await repository.createAdminSession(client,id,principal.id,hashSecret(cookie),hashSecret(csrf));
      const expiresAt=await repository.touchAdminSession(client,id);
      return {cookie,absoluteExpiresAt,session:{principalId:principal.id,csrfToken:csrf,expiresAt:expiresAt.toISOString()}};
    });
  }

  /** Lock and recheck current cookie/CSRF authority; never accept mobile Bearer credentials or principal IDs. */
  private async authorize(client:pg.PoolClient,cookie:string,origin?:string,csrf?:string):Promise<{row:repository.AdminSessionRow;csrf:string}> {
    if(!/^[a-f0-9]{64}$/.test(cookie)) throw unauthenticated();
    const hash=hashSecret(cookie),found=await repository.findAdminSession(client,hash); if(!found?.valid) throw unauthenticated();
    await repository.lockAdministrator(client,found.administrator_id,found.id);
    const row=await repository.findAdminSession(client,hash); if(!row?.valid) throw unauthenticated();
    const token=csrfToken(this.config.csrfKey,row.id,cookie);
    if(!timingSafeEqual(Buffer.from(hashSecret(token)),Buffer.from(row.csrf_token_hash))) throw unauthenticated();
    if(origin!==undefined||csrf!==undefined) {
      this.requireOrigin(origin);
      if(!csrf||!timingSafeEqual(Buffer.from(hashSecret(csrf)),Buffer.from(row.csrf_token_hash))) throw new IdentityError(403,'FORBIDDEN');
    }
    return {row,csrf:token};
  }

  /** Reconstruct CSRF and refresh idle activity for an authorized session without exposing the cookie in JSON. */
  async session(cookie:string):Promise<AdminSession> {
    return withTransaction(this.pool,async client=>{const {row,csrf}=await this.authorize(client,cookie);const expiresAt=await repository.touchAdminSession(client,row.id);return {principalId:row.administrator_id,csrfToken:csrf,expiresAt:expiresAt.toISOString()};});
  }

  /**
   * Run protected business work on the same locked transaction as current authority and idle activity.
   * A write requires exact Origin/CSRF; callback failures roll back all work. Callers must use this client,
   * follow principal→session→business lock order, and never commit/release it themselves.
   */
  async withAdministrator<T>(cookie:string,write:{origin:string|undefined;csrf:string|undefined}|undefined,work:(client:pg.PoolClient,principal:{principalId:string;sessionId:string})=>Promise<T>):Promise<T> {
    return withTransaction(this.pool,async client=>{
      if(write) this.requireOrigin(write.origin);
      const {row}=await this.authorize(client,cookie,write?.origin,write?.csrf);
      await repository.touchAdminSession(client,row.id);
      return work(client,{principalId:row.administrator_id,sessionId:row.id});
    });
  }

  /** Authorize downstream read/write guards, checking Origin and CSRF on every non-read request. */
  async authenticate(cookie:string,write=false,origin?:string,csrf?:string):Promise<{principalId:string;sessionId:string}> {
    return this.withAdministrator(cookie,write?{origin,csrf}:undefined,(_client,principal)=>Promise.resolve(principal));
  }

  /** Revoke this session only after cookie, exact Origin and session-bound CSRF validation; DB failures roll back. */
  async logout(cookie:string,origin:string|undefined,csrf:string|undefined):Promise<Record<string,never>> {
    this.requireOrigin(origin);
    return withTransaction(this.pool,async client=>{await this.authorize(client,cookie,origin,csrf);await repository.revokeAdminSession(client,(await repository.findAdminSession(client,hashSecret(cookie)))!.id);return {};});
  }
}
