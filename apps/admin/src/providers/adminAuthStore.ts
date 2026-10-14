import type { components } from '@holdlog/contracts/http';
import { AdminAuthError, type AdminAuthApi, type AuthFailureKind } from '../api/auth.ts';
import type { AdminSession } from '../api/contracts.ts';
export interface AuthFailure {kind:AuthFailureKind;status:number|null;code:components['schemas']['Error']['code']|null}
export interface AdminAuthSnapshot {status:'checking'|'anonymous'|'authenticated'|'unavailable';generation:number;principalId:string|null;expiresAt:string|null;failure:AuthFailure|null}
interface Options {clearProtectedData?:()=>void;now?:()=>number;schedule?:(work:()=>void,delay:number)=>()=>void}

/** Retain only a safe failure category; arbitrary callbacks/network errors cannot expose secret details. */
function safeFailure(error:unknown):AdminAuthError {return error instanceof AdminAuthError?error:new AdminAuthError('network');}

/**
 * Own memory-only administrator authority, expiry, response generations and protected-data invalidation.
 * Cookie-changing actions are ordered: an older response cannot overwrite a later login/logout cookie.
 * GET/business requests can be cancelled; mutation responses settle before the next cookie mutation starts.
 */
export class AdminAuthStore {
  private readonly api:AdminAuthApi;
  private readonly options:Options;
  private session:AdminSession|undefined;
  private snapshot:AdminAuthSnapshot={status:'checking',generation:0,principalId:null,expiresAt:null,failure:null};
  private readonly listeners=new Set<()=>void>();
  private readonly reads=new Set<AbortController>();
  private timerCancel:(()=>void)|undefined;
  private pendingCheck:Promise<void>|undefined;
  private mutationTail:Promise<void>=Promise.resolve();
  private mutations=0;
  private readonly now:()=>number;
  private readonly schedule:(work:()=>void,delay:number)=>()=>void;
  /** Inject transport, protected-cache cleanup and time without accessing browser storage or cookie values. */
  constructor(api:AdminAuthApi,options:Options={}) {
    this.api=api;this.options=options;
    this.now=options.now??Date.now;
    this.schedule=options.schedule??((work,delay)=>{const timer=setTimeout(work,delay);return ()=>clearTimeout(timer);});
  }
  /** Return a referentially stable public snapshot without CSRF, cookie or password. */
  getSnapshot=():AdminAuthSnapshot=>this.snapshot;
  /** Subscribe React or development consumers; unsubscribe does not change server session authority. */
  subscribe=(listener:()=>void):(()=>void)=>{this.listeners.add(listener);return ()=>{this.listeners.delete(listener);};};
  /** Publish one safe state after all internal authority changes have completed. */
  private publish(patch:Partial<AdminAuthSnapshot>):void {this.snapshot={...this.snapshot,...patch};const generation=this.snapshot.generation;for(const listener of this.listeners){if(generation!==this.snapshot.generation)return;listener();}}
  /** Invalidate the old generation before cleanup; every callback runs without retaining old session secrets. */
  private boundary(status:AdminAuthSnapshot['status']='anonymous',failure:AuthFailure|null=null):number {
    const requests=[...this.reads],cancel=this.timerCancel;
    this.reads.clear();this.pendingCheck=undefined;this.timerCancel=undefined;this.session=undefined;
    const generation=this.snapshot.generation+1;
    this.snapshot={status,generation,principalId:null,expiresAt:null,failure};
    // Invalidate first; cancellation, cleanup and notification callbacks may initiate a newer transition.
    for(const request of requests)request.abort();cancel?.();
    if(generation!==this.snapshot.generation)return generation;
    try {this.options.clearProtectedData?.();}catch {status='unavailable';failure=new AdminAuthError('cleanup');}
    if(generation===this.snapshot.generation)this.publish({status,failure});
    return generation;
  }
  /** Install current authority only for this generation; principal change and expired responses purge old data. */
  private accept(value:AdminSession,generation:number):void {
    if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');
    const remaining=Date.parse(value.expiresAt)-this.now();if(remaining<=0){const failure=new AdminAuthError('http',401,'UNAUTHENTICATED');this.boundary('anonymous',failure);throw failure;}
    if(this.session?.principalId!==value.principalId){generation=this.boundary('checking');if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');if(this.snapshot.failure?.kind==='cleanup')throw new AdminAuthError('cleanup');}
    this.timerCancel?.();if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');
    this.session=value;const current=generation;
    this.publish({status:'authenticated',principalId:value.principalId,expiresAt:value.expiresAt,failure:null});
    this.armExpiry(current);
    if(current!==this.snapshot.generation)throw this.snapshot.failure?.status===401?new AdminAuthError('http',401,'UNAUTHENTICATED'):new AdminAuthError('stale');
  }
  /** Chunk long clock distances to the browser timer range and expire only the still-current generation. */
  private armExpiry(generation:number):void {
    if(!this.session||generation!==this.snapshot.generation)return;
    const remaining=Date.parse(this.session.expiresAt)-this.now();
    if(remaining<=0){this.boundary('anonymous',new AdminAuthError('http',401,'UNAUTHENTICATED'));return;}
    this.timerCancel=this.schedule(()=>{this.armExpiry(generation);},Math.min(remaining,2147483647));
  }
  /** Treat definite401/403 as authority loss; transient failures preserve an already valid session and form inputs. */
  private failed(error:unknown,generation:number):void {
    if(generation!==this.snapshot.generation)return;
    const failure=safeFailure(error);if(failure.kind==='stale'||failure.kind==='cancelled')return;
    if(this.session&&Date.parse(this.session.expiresAt)<=this.now()){this.boundary('anonymous',new AdminAuthError('http',401,'UNAUTHENTICATED'));return;}
    if(failure.status===401)this.boundary('anonymous',failure);
    else if(failure.status===403)this.boundary('unavailable',failure);
    else this.publish({status:this.session?'authenticated':'unavailable',failure});
  }
  /** Share a session reconstruction request; a late response never restores a replaced/logged-out generation. */
  check():Promise<void> {
    if(this.mutations){const generation=this.snapshot.generation;return this.mutationTail.then(()=>{if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');return this.check();});}
    if(this.pendingCheck)return this.pendingCheck;
    const generation=this.snapshot.generation,controller=new AbortController();this.reads.add(controller);
    const pending=this.api.session(controller.signal).then(value=>{if(generation===this.snapshot.generation)this.accept(value,generation);},error=>{this.failed(error,generation);}).finally(()=>{this.reads.delete(controller);if(this.pendingCheck===pending)this.pendingCheck=undefined;});
    this.pendingCheck=pending;return pending;
  }
  /** Serialize cookie mutations without cancelling a request whose Set-Cookie response can still arrive. */
  private ordered<T>(work:()=>Promise<T>):Promise<T> {this.mutations++;const result=this.mutationTail.then(work).finally(()=>{this.mutations--;});this.mutationTail=result.then(()=>undefined,()=>undefined);return result;}
  /** Clear old authority first, then issue one ordered login; stale results cannot publish a new principal. */
  login(input:components['schemas']['AdminLoginInput'],key:string):Promise<void> {
    let generation=-1;
    const pending=this.ordered(async()=>{if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');try {this.accept(await this.api.login(input,key),generation);}catch(error){this.failed(error,generation);throw safeFailure(error);}});
    generation=this.boundary('checking');return pending;
  }
  /** Clear local secrets immediately, then reconstruct/revoke the server cookie after older mutations settle. */
  logout(key:string):Promise<void> {
    let generation=-1;
    const pending=this.ordered(async()=>{if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');try {const current=await this.api.session();await this.api.logout(current.csrfToken,key);}catch(error){const failure=safeFailure(error);if(failure.status===401)return;this.failed(failure,generation);throw failure;}});
    generation=this.boundary();return pending;
  }
  /**
   * Run an authorized request with memory-only CSRF and cancellation, then apply its result synchronously
   * only if principal/generation/expiry remain current. No automatic write retry or stale success is returned.
   */
  async runProtected<T>(request:(context:{csrfToken:string;signal:AbortSignal})=>Promise<T>,apply:(value:T)=>void):Promise<T> {
    if(!this.session||Date.parse(this.session.expiresAt)<=this.now()){if(this.session)this.boundary();throw new AdminAuthError('http',401,'UNAUTHENTICATED');}
    const generation=this.snapshot.generation,controller=new AbortController(),csrfToken=this.session.csrfToken;this.reads.add(controller);
    try {const result=await request({csrfToken,signal:controller.signal});if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');await this.check();if(this.snapshot.failure){const failure=this.snapshot.failure;throw new AdminAuthError(failure.kind,failure.status,failure.code);}if(generation!==this.snapshot.generation)throw new AdminAuthError('stale');if(!this.session||Date.parse(this.session.expiresAt)<=this.now()){this.boundary();throw new AdminAuthError('stale');}apply(result);return result;}
    catch(error){this.failed(error,generation);throw safeFailure(error);}finally {this.reads.delete(controller);}
  }
  /** Stop listeners' authority lifetime on unmount without assuming the server cookie has been revoked. */
  suspend():void {this.boundary();}
}
