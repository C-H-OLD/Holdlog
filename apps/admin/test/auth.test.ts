import assert from 'node:assert/strict';
import { test,afterEach } from 'node:test';
import { randomUUID } from 'node:crypto';
import { createAdminAuthApi, AdminAuthError } from '../src/api/auth.ts';
import { AdminAuthStore } from '../src/providers/adminAuthStore.ts';
import type { AdminSession } from '../src/api/contracts.ts';
const stores:AdminAuthStore[]=[];
/** Register fixture lifetimes so a failed assertion cannot leave an expiry timer running. */
function trackStore(...args:ConstructorParameters<typeof AdminAuthStore>):AdminAuthStore {const store=new AdminAuthStore(...args);stores.push(store);return store;}
afterEach(()=>{for(const store of stores.splice(0))store.suspend();});
const principal=randomUUID();
/** Construct only synthetic contract data; never use a real credential or cookie in the unit suite. */
function session(id=principal,expiresAt=new Date(Date.now()+3600000).toISOString()):AdminSession {return {principalId:id,csrfToken:'synthetic-csrf',expiresAt};}
/** Return a generated-compatible error body without including the submitted input. */
function errorResponse(status:number,code='UNAUTHENTICATED'):Response {return Response.json({code,requestId:randomUUID(),fieldErrors:[],currentVersion:null,resourceId:null,retryable:status===503,blockingCrewIds:[],existingVisitId:null},{status});}
/** Hold an adapter response until the test deliberately resolves its request race. */
function deferred<T>() {let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});return {promise,resolve};}

void test('auth transport consumes generated operations with browser cookies and explicit request keys/CSRF',async()=>{
  const calls:{url:string;init:RequestInit}[]=[];
  const api=createAdminAuthApi((input,init)=>{calls.push({url:typeof input==='string'?input:input instanceof URL?input.href:input.url,init:init!});return Promise.resolve(Response.json(calls.length===3?{}:session()));});const key=randomUUID();
  await api.login({loginId:'fixture',password:'synthetic-password'},key);await api.session();await api.logout('synthetic-csrf',key);
  assert.deepEqual(calls.map(call=>call.url),['/api/v2/admin/auth/sessions','/api/v2/admin/auth/sessions/current','/api/v2/admin/auth/sessions/current']);
  assert.deepEqual(calls.map(call=>call.init.method),['POST','GET','DELETE']);
  for(const call of calls){assert.equal(call.init.credentials,'same-origin');assert.equal(call.init.cache,'no-store');const headers=new Headers(call.init.headers);assert.equal(headers.has('Authorization'),false);assert.equal(headers.has('Cookie'),false);assert.equal(headers.has('Origin'),false);}
  assert.equal(new Headers(calls[0]!.init.headers).get('Idempotency-Key'),key);assert.equal(new Headers(calls[2]!.init.headers).get('X-CSRF-Token'),'synthetic-csrf');assert.equal(calls[2]!.init.body,undefined);
});

void test('generated input/response errors and HTTP failures remain typed and never expose raw values',async()=>{
  let calls=0;const api=createAdminAuthApi(()=>{calls++;return Promise.resolve(Response.json({...session(),unknown:'synthetic-secret-marker'}));});
  await assert.rejects(api.login({loginId:'fixture',password:'fixture'},'invalid'),{kind:'input'});assert.equal(calls,0);
  await assert.rejects(api.session(),error=>error instanceof AdminAuthError&&error.kind==='contract'&&!error.message.includes('synthetic-secret-marker'));
  for(const [status,code] of [[401,'UNAUTHENTICATED'],[403,'FORBIDDEN'],[503,'TEMPORARY_FAILURE']] as const) await assert.rejects(createAdminAuthApi(()=>Promise.resolve(errorResponse(status,code))).session(),{kind:'http',status,code});
  await assert.rejects(createAdminAuthApi(()=>Promise.resolve(Response.json({raw:'synthetic-secret-marker'},{status:503}))).session(),{kind:'contract'});
  await assert.rejects(createAdminAuthApi(()=>Promise.reject(new Error('synthetic-secret-marker'))).session(),error=>error instanceof AdminAuthError&&error.kind==='network'&&!error.message.includes('synthetic-secret-marker'));
});

void test('cancellation and deadline are distinguishable from authentication failures',async()=>{
  const fetcher:typeof fetch=(_input,init)=>new Promise((_resolve,reject)=>{init!.signal!.addEventListener('abort',()=>reject(new Error('synthetic aborted')),{once:true});});
  const abort=new AbortController(),api=createAdminAuthApi(fetcher,{timeoutMs:20}),pending=api.session(abort.signal);abort.abort();await assert.rejects(pending,{kind:'cancelled'});
  const keepAlive=setTimeout(()=>undefined,50);try {await assert.rejects(api.session(),{kind:'timeout'});}finally {clearTimeout(keepAlive);}
});

void test('session check deduplicates, reconstructs CSRF and preserves authority on temporary network failure',async()=>{
  let calls=0,offline=false;const held=deferred<Response>();const api=createAdminAuthApi(()=>{calls++;if(offline)return Promise.reject(new Error('offline'));return calls===1?held.promise:Promise.resolve(Response.json(session()));});let cleared=0;
  const store=trackStore(api,{clearProtectedData:()=>{cleared++;}});const first=store.check(),second=store.check();held.resolve(Response.json(session()));await Promise.all([first,second]);assert.equal(calls,1);assert.equal(store.getSnapshot().status,'authenticated');assert.equal(JSON.stringify(store.getSnapshot()).includes('synthetic-csrf'),false);
  offline=true;await store.check();assert.equal(store.getSnapshot().status,'authenticated');assert.equal(store.getSnapshot().failure?.kind,'network');assert.equal(cleared,1);store.suspend();
});

void test('logout clears authority and protected data before waiting and blocks delayed authenticated responses',async()=>{
  const held=deferred<Response>();let calls=0,cleared=0;const store=trackStore(createAdminAuthApi(()=>{calls++;return calls===1?held.promise:Promise.resolve(errorResponse(401));}),{clearProtectedData:()=>{cleared++;}});
  const check=store.check(),logout=store.logout(randomUUID());assert.equal(store.getSnapshot().principalId,null);assert.ok(cleared>0);held.resolve(Response.json(session()));await Promise.all([check,logout]);assert.equal(store.getSnapshot().status,'anonymous');store.suspend();
});

void test('principal changes and local expiry purge protected state and discard late work',async()=>{
  let clock=Date.now(),current=session(),cleared=0;const timers:(()=>void)[]=[];const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(current))),{clearProtectedData:()=>{cleared++;},now:()=>clock,schedule:work=>{timers.push(work);return ()=>undefined;}});await store.check();const held=deferred<string>();let applied=false;
  const pending=store.runProtected(()=>held.promise,()=>{applied=true;});const rejected=assert.rejects(pending,{kind:'stale'});current=session(randomUUID());await store.check();held.resolve('old-protected-data');await rejected;assert.equal(applied,false);assert.equal(cleared,2);clock=Date.parse(current.expiresAt);timers.at(-1)!();assert.equal(store.getSnapshot().status,'anonymous');assert.equal(store.getSnapshot().principalId,null);store.suspend();
});

void test('401 and403 discard authority/CSRF while network failures preserve inputs and do not become empty success',async()=>{
  for(const status of [401,403,503]) {
    let cleared=0;const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(session()))),{clearProtectedData:()=>{cleared++;}});await store.check();let applied=false;
    await assert.rejects(store.runProtected(()=>Promise.reject(new AdminAuthError('http',status,status===401?'UNAUTHENTICATED':status===403?'FORBIDDEN':'TEMPORARY_FAILURE')),()=>{applied=true;}));assert.equal(applied,false);
    assert.equal(store.getSnapshot().status,status===401?'anonymous':status===403?'unavailable':'authenticated');assert.equal(cleared,status===503?1:2);store.suspend();
  }
});

void test('cookie-changing login/logout actions are ordered and a late login cannot reopen a locally logged out store',async()=>{
  const held=deferred<Response>();const methods:string[]=[];const api=createAdminAuthApi((_input,init)=>{methods.push(init!.method!);if(init!.method==='POST')return held.promise;return Promise.resolve(Response.json(init!.method==='DELETE'?{}:session()));});const store=trackStore(api);
  const login=store.login({loginId:'fixture',password:'synthetic-password'},randomUUID()),rejected=assert.rejects(login,{kind:'stale'});await new Promise(resolve=>setImmediate(resolve));const logout=store.logout(randomUUID());held.resolve(Response.json(session()));await Promise.all([rejected,logout]);assert.deepEqual(methods,['POST','GET','DELETE']);assert.equal(store.getSnapshot().status,'anonymous');store.suspend();
});

void test('session rechecks wait for logout cookie mutation and cannot restore its old authority',async()=>{
  const held=deferred<Response>();let deleted=false;const api=createAdminAuthApi((_input,init)=>{if(init!.method==='DELETE')return held.promise.then(response=>{deleted=true;return response;});return Promise.resolve(deleted?errorResponse(401):Response.json(session()));});const store=trackStore(api);await store.check();
  const logout=store.logout(randomUUID());await new Promise(resolve=>setImmediate(resolve));const check=store.check();await new Promise(resolve=>setImmediate(resolve));assert.equal(store.getSnapshot().status,'anonymous');held.resolve(Response.json({}));await Promise.all([logout,check]);assert.equal(store.getSnapshot().status,'anonymous');
});

void test('cleanup failure blocks authority publication and an expired transient failure cannot preserve authentication',async()=>{
  const broken=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(session()))),{clearProtectedData:()=>{throw new Error('synthetic-secret');}});await assert.rejects(broken.check(),{kind:'cleanup'});assert.equal(broken.getSnapshot().status,'unavailable');assert.equal(broken.getSnapshot().principalId,null);
  let clock=0,offline=false;const store=trackStore(createAdminAuthApi(()=>offline?Promise.reject(new Error('offline')):Promise.resolve(Response.json(session(principal,'2026-10-14T00:00:00Z')))),{now:()=>clock,schedule:()=>()=>undefined});await store.check();clock=Date.parse('2026-10-15T00:00:00Z');offline=true;await store.check();assert.equal(store.getSnapshot().status,'anonymous');
});

void test('successful protected work rechecks server expiry and applies only current authorized results',async()=>{
  let current=session(principal,new Date(Date.now()+60000).toISOString());const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(current))));await store.check();let applied='';
  const next=session(principal,new Date(Date.now()+120000).toISOString());await store.runProtected(({csrfToken})=>{assert.equal(csrfToken,'synthetic-csrf');current=next;return Promise.resolve('protected-result');},value=>{applied=value;});assert.equal(applied,'protected-result');assert.equal(store.getSnapshot().expiresAt,next.expiresAt);
});

void test('malformed401/403 bodies still discard protected authority while reporting a contract failure',async()=>{
  for(const status of [401,403]) {let available=true;const store=trackStore(createAdminAuthApi(()=>Promise.resolve(available?Response.json(session()):Response.json({raw:'synthetic-secret'},{status}))));await store.check();available=false;await store.check();assert.equal(store.getSnapshot().principalId,null);assert.equal(store.getSnapshot().failure?.kind,'contract');}
});

void test('an expired login response is a failure and cannot announce successful authentication',async()=>{
  const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(session(principal,'2000-01-01T00:00:00Z')))));await assert.rejects(store.login({loginId:'fixture',password:'synthetic'},randomUUID()),{kind:'http',status:401});assert.equal(store.getSnapshot().status,'anonymous');assert.equal(store.getSnapshot().principalId,null);
});

void test('long expiry timers are chunked rather than overflowing browser timers into immediate logout',async()=>{
  let clock=0;const scheduled:{work:()=>void;delay:number}[]=[];const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(session(principal,'2099-01-01T00:00:00Z')))),{now:()=>clock,schedule:(work,delay)=>{scheduled.push({work,delay});return ()=>undefined;}});await store.check();assert.ok(scheduled[0]!.delay<=2147483647);clock=scheduled[0]!.delay;scheduled[0]!.work();assert.equal(store.getSnapshot().status,'authenticated');assert.equal(scheduled.length,2);clock=Date.parse('2099-01-01T00:00:00Z');scheduled[1]!.work();assert.equal(store.getSnapshot().status,'anonymous');
});

void test('expiry reached while installing authority cannot republish an authenticated snapshot',async()=>{
  let reads=0;const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(session(principal,new Date(1).toISOString())))),{now:()=>reads++===0?0:2,schedule:()=>()=>undefined});await assert.rejects(store.login({loginId:'fixture',password:'synthetic'},randomUUID()));assert.equal(store.getSnapshot().status,'anonymous');assert.equal(store.getSnapshot().principalId,null);
});

void test('reentrant logout during session acceptance never restores invalidated authority',async()=>{
  const methods:string[]=[];const store=trackStore(createAdminAuthApi((_input,init)=>{methods.push(init!.method!);return Promise.resolve(Response.json(init!.method==='DELETE'?{}:session()));}));
  let logout:Promise<void>|undefined;
  const unsubscribe=store.subscribe(()=>{if(store.getSnapshot().status==='checking'&&!logout){unsubscribe();logout=store.logout(randomUUID());}});
  await assert.rejects(store.check(),{kind:'stale'});
  let issued=false;await assert.rejects(store.runProtected(()=>{issued=true;return Promise.resolve();},()=>undefined),{status:401});
  assert.equal(issued,false);await logout;assert.equal(store.getSnapshot().status,'anonymous');assert.deepEqual(methods,['GET','GET','DELETE']);
});

void test('reentrant cleanup invalidation wins over its suspended outer boundary',async()=>{
  let once=true;
  const store=trackStore(createAdminAuthApi(()=>Promise.resolve(Response.json(session()))),{clearProtectedData:()=>{if(once){once=false;store.suspend();}}});
  await assert.rejects(store.check(),{kind:'stale'});assert.equal(store.getSnapshot().status,'anonymous');assert.equal(store.getSnapshot().principalId,null);
});

void test('login reserves mutation ordering before notifying a subscriber that logs out',async()=>{
  const methods:string[]=[];const store=trackStore(createAdminAuthApi((_input,init)=>{methods.push(init!.method!);return Promise.resolve(Response.json(init!.method==='DELETE'?{}:session()));}));
  let logout:Promise<void>|undefined;
  const unsubscribe=store.subscribe(()=>{if(store.getSnapshot().status==='checking'){unsubscribe();logout=store.logout(randomUUID());}});
  await assert.rejects(store.login({loginId:'fixture',password:'synthetic'},randomUUID()),{kind:'stale'});
  await logout;assert.deepEqual(methods,['GET','DELETE']);assert.equal(store.getSnapshot().status,'anonymous');
});

void test('a session check waiting behind login cannot restart authority after suspension',async()=>{
  const held=deferred<Response>();const methods:string[]=[];
  const store=trackStore(createAdminAuthApi((_input,init)=>{methods.push(init!.method!);return init!.method==='POST'?held.promise:Promise.resolve(Response.json(session()));}));
  const login=store.login({loginId:'fixture',password:'synthetic'},randomUUID()),loginRejected=assert.rejects(login,{kind:'stale'});
  await new Promise(resolve=>setImmediate(resolve));
  const check=store.check(),checkRejected=assert.rejects(check,{kind:'stale'});
  store.suspend();held.resolve(Response.json(session()));await Promise.all([loginRejected,checkRejected]);
  assert.deepEqual(methods,['POST']);assert.equal(store.getSnapshot().status,'anonymous');
});

void test('protected results are not applied when session revalidation fails transiently',async()=>{
  for(const kind of ['network','timeout','contract'] as const){
    let offline=false;const store=trackStore({login:()=>Promise.resolve(session()),logout:()=>Promise.resolve({}),session:()=>offline?Promise.reject(new AdminAuthError(kind)):Promise.resolve(session())});
    await store.check();offline=true;let applied=false;
    await assert.rejects(store.runProtected(()=>Promise.resolve('protected'),()=>{applied=true;}),{kind});
    assert.equal(applied,false);assert.equal(store.getSnapshot().status,'authenticated');assert.equal(store.getSnapshot().failure?.kind,kind);
  }
});
