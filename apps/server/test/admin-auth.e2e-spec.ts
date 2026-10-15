import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { verify } from 'argon2';
import type Database from 'better-sqlite3';
import { AdministratorBootstrap } from '../src/modules/identity/admin-bootstrap.service.js';
import { AdminSessionService } from '../src/modules/identity/admin-session.js';
import { createApplication } from '../src/app.module.js';
import { DATABASE } from '../src/health/controller.js';
import { isoFromNow, testDatabase, type TestDatabase } from './helpers.js';
import type { components } from '@holdlog/contracts/http';
const origin = 'https://localhost:5173';

void test('administrator create-only and versioned replacement preserve active status and revoke every session atomically', async () => {
  const {db,close}=testDatabase();
  const loginId='synthetic-'+randomUUID(), password=randomBytes(32).toString('hex');
  const bootstrap=new AdministratorBootstrap(db), sessions=new AdminSessionService(db,{csrfKey:randomBytes(32),allowedOrigins:[origin]});
  try {
    const admin=await bootstrap.create(loginId,password); assert.equal(admin.version,1);
    const row=db.prepare<[string],{credential_hash:string;active:number;version:number}>('SELECT credential_hash,active,version FROM service_administrators WHERE id=?').get(admin.id)!;
    assert.equal(row.active,1); assert.match(row.credential_hash,/^\$argon2id\$/); assert.ok(!row.credential_hash.includes(password)); assert.equal(await verify(row.credential_hash,password),true);
    await assert.rejects(bootstrap.create(loginId,'different'),{code:'ALREADY_EXISTS'});
    assert.equal(db.prepare<[string],{credential_hash:string}>('SELECT credential_hash FROM service_administrators WHERE id=?').get(admin.id)?.credential_hash,row.credential_hash);
    const first=await sessions.login({loginId,password},origin), second=await sessions.login({loginId,password},origin);
    assert.equal((await sessions.session(first.cookie)).principalId,admin.id);
    const next=randomBytes(32).toString('hex'); await bootstrap.replace(loginId,next,1);
    await assert.rejects(sessions.session(first.cookie),{code:'UNAUTHENTICATED'}); await assert.rejects(sessions.session(second.cookie),{code:'UNAUTHENTICATED'});
    await assert.rejects(sessions.login({loginId,password},origin),{code:'UNAUTHENTICATED'});
    await assert.rejects(bootstrap.replace(loginId,'stale',1),{code:'VERSION_CONFLICT'});
    await assert.rejects(bootstrap.replace('missing-'+randomUUID(),'fixture',1),{code:'NOT_FOUND'});
    const current=await sessions.login({loginId,password:next},origin); assert.equal(current.session.principalId,admin.id);
    db.prepare('UPDATE service_administrators SET active=0 WHERE id=?').run(admin.id);
    await bootstrap.replace(loginId,'inactive-replacement',2);
    assert.equal(db.prepare<[string],{active:number}>('SELECT active FROM service_administrators WHERE id=?').get(admin.id)?.active,0);
    await assert.rejects(sessions.login({loginId,password:'inactive-replacement'},origin),{code:'UNAUTHENTICATED'});
  } finally { close(); }
});

void test('admin HTTP enforces origin/cookie/CSRF separation and generated shapes without returning cookie secrets', async () => {
  const {config,db,close}=testDatabase();
  const loginId='synthetic-'+randomUUID(),password=randomBytes(32).toString('hex'), bootstrap=new AdministratorBootstrap(db);
  const principal=await bootstrap.create(loginId,password);
  const app=await createApplication(config,undefined,{csrfKey:randomBytes(32),allowedOrigins:[origin]}); await app.listen(0,'127.0.0.1');
  const base=await app.getUrl();
  /** Send synthetic admin requests through the real Nest HTTP adapter and retain status/cookie metadata. */
  async function request(path:string,method='POST',body?:unknown,headers:Record<string,string>={}) {
    const response=await fetch(base+'/api/v2'+path,{method,headers:{'Content-Type':'application/json','Idempotency-Key':randomUUID(),Origin:origin,...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
    return {response,body:await response.json() as Record<string,unknown>};
  }
  try {
    for (const bad of ['', 'null','https://evil.invalid',origin+'/path']) assert.equal((await request('/admin/auth/sessions','POST',{loginId,password},{Origin:bad})).response.status,403);
    assert.equal((await request('/admin/auth/sessions','POST',{loginId,password,extra:true})).response.status,400);
    assert.equal((await request('/admin/auth/sessions','POST',{loginId,password:'wrong'})).response.status,401);
    const login=await request('/admin/auth/sessions','POST',{loginId,password}); assert.equal(login.response.status,200);
    const setCookie=login.response.headers.get('set-cookie')!; assert.match(setCookie,/HttpOnly/i); assert.match(setCookie,/Secure/i); assert.match(setCookie,/SameSite=Lax/i); assert.match(setCookie,/Path=\/api\/v2\/admin(?:;|$)/);
    // The cookie lifetime still comes from the stored eight-hour absolute expiry, now read back as UTC text.
    const maxAge=Number(/Max-Age=(\d+)/.exec(setCookie)?.[1]); assert.ok(maxAge>8*3600-60&&maxAge<=8*3600,String(maxAge));
    const cookie=setCookie.split(';')[0]!; assert.ok(!JSON.stringify(login.body).includes(cookie.split('=')[1]!));
    const session=login.body as unknown as components['schemas']['AdminSession']; assert.equal(session.principalId,principal.id);
    assert.equal((await request('/admin/auth/sessions/current','GET',undefined,{Cookie:cookie})).body.csrfToken,session.csrfToken);
    assert.equal((await request('/admin/auth/sessions/current','GET',undefined,{Authorization:'Bearer '+cookie.split('=')[1]!})).response.status,401);
    assert.equal((await request('/me','GET',undefined,{Cookie:cookie})).response.status,404);
    for (const csrf of ['', 'wrong']) assert.equal((await request('/admin/auth/sessions/current','DELETE',undefined,{Cookie:cookie,'X-CSRF-Token':csrf})).response.status,403);
    assert.equal((await request('/admin/auth/sessions/current','DELETE',undefined,{Cookie:cookie,'X-CSRF-Token':session.csrfToken,Origin:'https://evil.invalid'})).response.status,403);
    const logout=await request('/admin/auth/sessions/current','DELETE',undefined,{Cookie:cookie,'X-CSRF-Token':session.csrfToken}); assert.equal(logout.response.status,200); assert.match(logout.response.headers.get('set-cookie')!,/Max-Age=0/);
    assert.equal((await request('/admin/auth/sessions/current','GET',undefined,{Cookie:cookie})).response.status,401);
  } finally {await app.close(); close();}
});

/** Own an isolated DB with one synthetic administrator so assertions cannot leave credentials or open connections behind. */
async function withAdmin(work:(database:TestDatabase,bootstrap:AdministratorBootstrap,sessions:AdminSessionService,loginId:string,password:string,id:string)=>Promise<void>):Promise<void> {
  const database=testDatabase(),loginId='synthetic-'+randomUUID(),password=randomBytes(32).toString('hex');
  try {const bootstrap=new AdministratorBootstrap(database.db),sessions=new AdminSessionService(database.db,{csrfKey:randomBytes(32),allowedOrigins:[origin]});const id=(await bootstrap.create(loginId,password)).id;await work(database,bootstrap,sessions,loginId,password,id);}
  finally {database.close();}
}

void test('bootstrap concurrent creates/replacements allow one winner and hash failures leave storage unchanged',()=>withAdmin(async({db},bootstrap,_sessions,loginId,password,id)=>{
  const duplicate='synthetic-'+randomUUID();
  const created=await Promise.allSettled([bootstrap.create(duplicate,password),bootstrap.create(duplicate,password)]);assert.equal(created.filter(value=>value.status==='fulfilled').length,1);
  const replaced=await Promise.allSettled([bootstrap.replace(loginId,'first-replacement',1),bootstrap.replace(loginId,'second-replacement',1)]);assert.equal(replaced.filter(value=>value.status==='fulfilled').length,1);
  assert.equal(db.prepare<[string],{version:number}>('SELECT version FROM service_administrators WHERE id=?').get(id)?.version,2);
  const before=db.prepare('SELECT * FROM service_administrators WHERE id=?').all(id);
  const broken=new AdministratorBootstrap(db,{hash:()=>Promise.reject(new Error('synthetic-secret-detail')),verify:()=>Promise.resolve(false)});
  await assert.rejects(broken.create('hash-failure-'+randomUUID(),password));await assert.rejects(broken.replace(loginId,password,2));
  assert.deepEqual(db.prepare('SELECT * FROM service_administrators WHERE id=?').all(id),before);
}));

void test('password replacement rollback preserves old credential/version and every existing session',()=>withAdmin(async({db},bootstrap,sessions,loginId,password,id)=>{
  const session=await sessions.login({loginId,password},origin);
  db.exec("CREATE TEMP TRIGGER test_admin_revoke_failure BEFORE UPDATE ON main.admin_sessions BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
  try {await assert.rejects(bootstrap.replace(loginId,'new-password',1));}
  finally {db.exec('DROP TRIGGER test_admin_revoke_failure');}
  assert.equal((await sessions.session(session.cookie)).principalId,id);
  assert.equal(db.prepare<[string],{version:number}>('SELECT version FROM service_administrators WHERE id=?').get(id)?.version,1);
  await sessions.login({loginId,password},origin);
}));

void test('admin sessions enforce statement-time idle/absolute expiry and inactivity without sliding the absolute boundary',()=>withAdmin(async({db},_bootstrap,sessions,loginId,password,id)=>{
  const first=await sessions.login({loginId,password},origin),second=await sessions.login({loginId,password},origin);
  const {hashSecret}=await import('../src/modules/identity/identity.repository.js');
  db.prepare('UPDATE admin_sessions SET last_activity_at=? WHERE session_secret_hash=?').run(isoFromNow(-30*60_000),hashSecret(first.cookie));
  await assert.rejects(sessions.session(first.cookie),{code:'UNAUTHENTICATED'});
  db.prepare('UPDATE admin_sessions SET created_at=?,expires_at=? WHERE session_secret_hash=?').run(isoFromNow(-8*3_600_000),isoFromNow(-1),hashSecret(second.cookie));
  await assert.rejects(sessions.session(second.cookie),{code:'UNAUTHENTICATED'});
  const third=await sessions.login({loginId,password},origin);
  const before=db.prepare<[string],{expires_at:string}>('SELECT expires_at FROM admin_sessions WHERE session_secret_hash=?').get(hashSecret(third.cookie))!.expires_at;
  assert.equal((await sessions.session(third.cookie)).csrfToken,third.session.csrfToken);
  assert.equal(db.prepare<[string],{expires_at:string}>('SELECT expires_at FROM admin_sessions WHERE session_secret_hash=?').get(hashSecret(third.cookie))!.expires_at,before);
  db.prepare('UPDATE service_administrators SET active=0 WHERE id=?').run(id);await assert.rejects(sessions.session(third.cookie),{code:'UNAUTHENTICATED'});
}));

void test('CSRF belongs to one cookie/session and logout failure does not revoke an otherwise valid session',()=>withAdmin(async({db},_bootstrap,sessions,loginId,password,id)=>{
  const first=await sessions.login({loginId,password},origin),second=await sessions.login({loginId,password},origin);
  await assert.rejects(sessions.logout(first.cookie,origin,second.session.csrfToken),{code:'FORBIDDEN'});
  db.exec("CREATE TEMP TRIGGER test_admin_logout_failure BEFORE UPDATE ON main.admin_sessions WHEN NEW.revoked_at IS NOT NULL BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
  try {await assert.rejects(sessions.logout(first.cookie,origin,first.session.csrfToken));}
  finally {db.exec('DROP TRIGGER test_admin_logout_failure');}
  assert.equal((await sessions.session(first.cookie)).principalId,id);
  await sessions.logout(first.cookie,origin,first.session.csrfToken);await assert.rejects(sessions.session(first.cookie),{code:'UNAUTHENTICATED'});assert.equal((await sessions.session(second.cookie)).principalId,id);
}));

void test('login verified before password replacement cannot publish a session using the old credential',()=>withAdmin(async({db},bootstrap,_sessions,loginId,password,id)=>{
  const {administratorPasswords}=await import('../src/modules/identity/admin-credentials.js');
  let release!:()=>void,ready!:()=>void;const barrier=new Promise<void>(resolve=>{release=resolve;}),reached=new Promise<void>(resolve=>{ready=resolve;});
  const sessions=new AdminSessionService(db,{csrfKey:randomBytes(32),allowedOrigins:[origin]},{hash:input=>administratorPasswords.hash(input),verify:async(digest,input)=>{const valid=await administratorPasswords.verify(digest,input);ready();await barrier;return valid;}});
  const pending=sessions.login({loginId,password},origin),rejected=assert.rejects(pending,{code:'UNAUTHENTICATED'});
  try {await reached;await bootstrap.replace(loginId,'replacement',1);release();await rejected;assert.equal(db.prepare('SELECT id FROM admin_sessions WHERE administrator_id=?').all(id).length,0);}
  finally {release();await Promise.allSettled([pending,rejected]);}
}));

void test('protected work rechecks authority and rolls back session activity with its business transaction',()=>withAdmin(async({db},bootstrap,sessions,loginId,password,id)=>{
  const login=await sessions.login({loginId,password},origin);
  const before=db.prepare('SELECT last_activity_at FROM admin_sessions WHERE administrator_id=?').all(id);
  await assert.rejects(sessions.withAdministrator(login.cookie,{origin,csrf:login.session.csrfToken},(tx,principal)=>{assert.equal(principal.principalId,id);tx.prepare('UPDATE service_administrators SET active=0 WHERE id=?').run(id);throw new Error('synthetic business failure');}));
  assert.deepEqual(db.prepare('SELECT last_activity_at FROM admin_sessions WHERE administrator_id=?').all(id),before);
  assert.equal((await sessions.session(login.cookie)).principalId,id);
  await bootstrap.replace(loginId,password,1);
  let executed=false;await assert.rejects(sessions.withAdministrator(login.cookie,{origin,csrf:login.session.csrfToken},()=>{executed=true;}),{code:'UNAUTHENTICATED'});assert.equal(executed,false);
}));

void test('mobile and admin modules compose without granting member or spoofed crew roles administrator access',()=>withAdmin(async({config},_bootstrap,_sessions,loginId,password)=>{
  const subject=randomUUID(),deviceId=randomUUID();
  const app=await createApplication(config,{verify:input=>Promise.resolve({provider:input.provider,subject,email:null})},{csrfKey:randomBytes(32),allowedOrigins:[origin]});await app.listen(0,'127.0.0.1');const base=await app.getUrl();
  /** Exercise both registered modules using only synthetic provider credentials. */
  async function request(path:string,method='GET',body?:unknown,headers:Record<string,string>={}) {const response=await fetch(base+'/api/v2'+path,{method,headers:{'Content-Type':'application/json','Idempotency-Key':randomUUID(),Origin:origin,...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});return {response,body:await response.json() as Record<string,unknown>};}
  try {
    const challenge=await request('/auth/challenges','POST');const login=await request('/auth/sessions','POST',{provider:'google',idToken:'synthetic',challengeId:challenge.body.challengeId,deviceId,authorizationCode:null});
    const signup=await request('/auth/signups','POST',{signupToken:(login.body.signup as {signupToken:string}).signupToken,deviceId,name:'fixture'});assert.equal(signup.response.status,201);const mobile=signup.body as unknown as components['schemas']['MobileSession'];const accountId=mobile.profile.id;
    for(const headers of [{Authorization:'Bearer '+mobile.accessToken},{Cookie:'holdlog_admin_session='+mobile.accessToken,'X-Role':'crew_admin','X-Principal-Id':accountId}]) assert.equal((await request('/admin/auth/sessions/current','GET',undefined,headers)).response.status,401);
    const admin=await request('/admin/auth/sessions','POST',{loginId,password});assert.equal(admin.response.status,200);assert.equal(admin.response.headers.get('access-control-allow-origin'),origin);assert.equal((await request('/admin/auth/sessions/current','GET',undefined,{Origin:'http://localhost:5173'})).response.headers.get('access-control-allow-origin'),null);const cookie=admin.response.headers.get('set-cookie')!.split(';')[0]!;
    assert.equal((await request('/me','GET',undefined,{Cookie:cookie})).response.status,401);
    assert.equal((await request('/me','GET',undefined,{Authorization:'Bearer '+mobile.accessToken})).response.status,200);
    assert.equal((await request('/admin/auth/sessions/current','GET',undefined,{Cookie:cookie})).response.status,200);
    assert.equal((await request('/admin/auth/sessions/current','GET',undefined,{Cookie:cookie+'; '+cookie})).response.status,401);
  } finally {await app.close();}
}));

void test('CSRF key replacement invalidates existing sessions and login SQL failure creates no credentials',()=>withAdmin(async({config,db},_bootstrap,sessions,loginId,password,id)=>{
  const login=await sessions.login({loginId,password},origin);
  await assert.rejects(new AdminSessionService(db,{csrfKey:randomBytes(32),allowedOrigins:[origin]}).session(login.cookie),{code:'UNAUTHENTICATED'});
  const app=await createApplication(config,undefined,{csrfKey:randomBytes(32),allowedOrigins:[origin]});await app.listen(0,'127.0.0.1');
  try {
    // TEMP triggers belong to one connection, so the failure goes on the application's own connection.
    app.get<Database.Database>(DATABASE).exec("CREATE TEMP TRIGGER test_admin_login_failure BEFORE INSERT ON main.admin_sessions BEGIN SELECT RAISE(ABORT, 'synthetic-secret-detail'); END");
    const response=await fetch(await app.getUrl()+'/api/v2/admin/auth/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':randomUUID(),Origin:origin},body:JSON.stringify({loginId,password})});
    assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);const body=await response.text();assert.ok(!body.includes(password));assert.ok(!body.includes('synthetic-secret-detail'));
    assert.equal(db.prepare('SELECT id FROM admin_sessions WHERE administrator_id=?').all(id).length,1);
  } finally {await app.close();}
}));

void test('unknown/inactive login still verifies a digest and the process verification capacity rejects before hashing',()=>withAdmin(async({db},_bootstrap,_sessions,loginId,password,id)=>{
  let verified=0;const codec={hash:()=>Promise.resolve('dummy-digest'),verify:()=>{verified++;return Promise.resolve(false);}};
  const service=new AdminSessionService(db,{csrfKey:randomBytes(32),allowedOrigins:[origin]},codec);
  await assert.rejects(service.login({loginId:'missing-'+randomUUID(),password},origin),{code:'UNAUTHENTICATED'});assert.equal(verified,1);
  db.prepare('UPDATE service_administrators SET active=0 WHERE id=?').run(id);await assert.rejects(service.login({loginId,password},origin),{code:'UNAUTHENTICATED'});assert.equal(verified,2);
  await assert.rejects(service.login({loginId,password},origin),{code:'UNAUTHENTICATED'});assert.equal(verified,3);
  let release!:()=>void,ready!:()=>void,count=0;const barrier=new Promise<void>(resolve=>{release=resolve;}),reached=new Promise<void>(resolve=>{ready=resolve;});
  const blocked=new AdminSessionService(db,{csrfKey:randomBytes(32),allowedOrigins:[origin]},{hash:()=>Promise.resolve('unused'),verify:async()=>{if(++count===2)ready();await barrier;return false;}});
  const attempts=[assert.rejects(blocked.login({loginId,password},origin),{code:'UNAUTHENTICATED'}),assert.rejects(blocked.login({loginId,password},origin),{code:'UNAUTHENTICATED'})];
  try {await reached;await assert.rejects(blocked.login({loginId,password},origin),{code:'TEMPORARY_FAILURE'});assert.equal(count,2);}
  finally {release();await Promise.all(attempts);}

}));
