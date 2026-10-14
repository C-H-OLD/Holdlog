import type { components } from '@holdlog/contracts/http';
import { adminLoginChecks,adminSessionChecks,adminLogoutChecks } from '@holdlog/contracts/admin-auth-checks';
import { API_BASE_PATH, type AdminSession } from './contracts.ts';
type ErrorCode=components['schemas']['Error']['code'];
export type AuthFailureKind='input'|'contract'|'http'|'network'|'timeout'|'cancelled'|'stale'|'cleanup';

/** Safe transport failure; neither the raw response, submitted credentials nor original exception is retained. */
export class AdminAuthError extends Error {
  readonly kind:AuthFailureKind;readonly status:number|null;readonly code:ErrorCode|null;
  /** Describe a fixed category and optional validated HTTP status/code, without an arbitrary server message. */
  constructor(kind:AuthFailureKind,status:number|null=null,code:ErrorCode|null=null) {super('ADMIN_AUTH_'+kind.toUpperCase());this.name='AdminAuthError';this.kind=kind;this.status=status;this.code=code;}
}
export interface AdminAuthApi {
  login(input:components['schemas']['AdminLoginInput'],key:string,signal?:AbortSignal):Promise<AdminSession>;
  session(signal?:AbortSignal):Promise<AdminSession>;
  logout(csrf:string,key:string,signal?:AbortSignal):Promise<components['schemas']['EmptyResult']>;
}
type Operation='adminLogin'|'adminSession'|'adminLogout';
const operationChecks={adminLogin:adminLoginChecks,adminSession:adminSessionChecks,adminLogout:adminLogoutChecks};

/**
 * Build the same-origin cookie transport from generated paths/input/response checks with a bounded deadline.
 * Fetch injection permits isolated tests; the browser owns Origin/HttpOnly cookie and never receives Bearer tokens.
 * Callers retain request keys for retries. No mutation is automatically retried and raw failures never escape.
 */
export function createAdminAuthApi(fetcher:typeof fetch=globalThis.fetch,options:{timeoutMs?:number}={}):AdminAuthApi {
  const timeoutMs=options.timeoutMs??5000;
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1) throw new AdminAuthError('input');
  /** Validate generated input before sending, then validate the exact success or safe error response. */
  async function request<T>(operation:Operation,headers:Record<string,string>,body?:unknown,signal?:AbortSignal):Promise<T> {
    const contract=operationChecks[operation];
    for(const parameter of contract.parameters) if(!parameter.validator(headers[parameter.name])) throw new AdminAuthError('input');
    const bodyContract=contract.body['application/json'];if(bodyContract&&!bodyContract.validator(body))throw new AdminAuthError('input');
    const deadline=AbortSignal.timeout(timeoutMs),combined=signal?AbortSignal.any([signal,deadline]):deadline;
    if(signal?.aborted)throw new AdminAuthError('cancelled');
    let response:Response;
    try {response=await fetcher(API_BASE_PATH+contract.path,{method:contract.method.toUpperCase(),credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'}),...headers},signal:combined,...(body===undefined?{}:{body:JSON.stringify(body)})});}
    catch {throw new AdminAuthError(signal?.aborted?'cancelled':deadline.aborted?'timeout':'network');}
    let result:unknown;
    try {result=await response.json();}catch {throw new AdminAuthError(signal?.aborted?'cancelled':deadline.aborted?'timeout':'contract',response.status===200?null:response.status);}
    const shape=contract.responses[response.status===200?'200':'default']?.['application/json'];
    if(!shape||!shape.validator(result))throw new AdminAuthError('contract',response.status===200?null:response.status);
    if(response.status!==200)throw new AdminAuthError('http',response.status,(result as components['schemas']['Error']).code);
    return result as T;
  }
  return {
    /** Issue one login with an explicit request key; return only the contract's public session fields. */
    login:(input,key,signal)=>request('adminLogin',{'Idempotency-Key':key},input,signal),
    /** Reconstruct the current CSRF/expiry through the browser's same-origin cookie. */
    session:signal=>request('adminSession',{},undefined,signal),
    /** Revoke the current cookie session using its in-memory CSRF and the caller's retained key. */
    logout:(csrf,key,signal)=>request('adminLogout',{'Idempotency-Key':key,'X-CSRF-Token':csrf},undefined,signal),
  };
}
