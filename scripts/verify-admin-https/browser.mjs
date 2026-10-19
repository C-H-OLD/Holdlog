/* global document */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, mkdir, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '/opt/holdlog-browser/node_modules/playwright-core/index.mjs';

const fixture=JSON.parse(await readFile('/fixture/input.json','utf8'));
const options={headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--host-resolver-rules=MAP localhost host.docker.internal']};
let browser,stage='untrusted root negative control';
const checks=[];
const authPath='/api/v2/admin/auth/sessions',currentPath=authPath+'/current',protectedPath='/api/v2/admin/__verification/protected';
const errors=[];
const privateValues=new Set([fixture.password,fixture.replacement,fixture.memberToken,fixture.controlToken]);

/** Record a named assertion without retaining response bodies, password, token or cookie values in evidence. */
function passed(name) {checks.push(name);}
/** Ask the host fixture owner to mutate only this isolated test DB, outside product HTTP routes. */
async function control(action) {const response=await fetch(fixture.controlUrl,{method:'POST',headers:{Authorization:'Bearer '+fixture.controlToken,'Content-Type':'application/json'},body:JSON.stringify({action})});assert.ok(response.ok,'Fixture control failed');return response.json();}
/** Execute browser fetch with browser-owned cookies; never set a Cookie header from the test harness. */
async function request(page,path,method='GET',headers={},credentials='same-origin') {return page.evaluate(async({path,method,headers,credentials})=>{const response=await fetch(path,{method,headers,credentials,cache:'no-store'});return {status:response.status,body:await response.json()};},{path,method,headers,credentials});}
/** Open the actual development Provider and await its initial reconstruction without TLS error bypass. */
async function open(context,origin=fixture.origin) {const page=await context.newPage();page.on('pageerror',()=>errors.push('page runtime error'));page.on('console',message=>{if([...privateValues].some(value=>message.text().includes(value)))errors.push('private value in console');});page.on('request',request=>{if([...privateValues].some(value=>request.url().includes(value)))errors.push('private value in URL');});await page.goto(origin+'/__development/admin-auth');await page.getByLabel('세션 상태',{exact:true}).filter({hasText:/anonymous|authenticated/}).waitFor();return page;}
/** Submit hidden fixture input through the real form; read only validated API data internally. */
async function login(page,password,status=200) {
  await page.getByRole('textbox',{name:'loginId',exact:true}).fill(fixture.loginId);await page.getByLabel('password',{exact:false}).fill(password);
  const received=page.waitForResponse(response=>response.url()===fixture.origin+authPath&&response.request().method()==='POST');
  await page.getByRole('button',{name:'로그인 검사',exact:true}).click();const response=await received;
  assert.equal(response.status(),status,'Login status');await page.getByLabel('세션 상태',{exact:true}).filter({hasText:status===200?'authenticated':'anonymous'}).waitFor();assert.equal(await page.getByLabel('password',{exact:false}).inputValue(),'','Password cleared');
  return {body:await response.json(),headers:await response.allHeaders(),requestHeaders:await response.request().allHeaders(),security:await response.securityDetails()};
}
/** Reconstruct through the actual Provider and assert the current server authority result. */
async function check(page,status) {const received=page.waitForResponse(response=>response.url()===fixture.origin+currentPath&&response.request().method()==='GET');await page.getByRole('button',{name:'세션 재조회',exact:true}).click();assert.equal((await received).status(),status,'Session status');await page.getByLabel('세션 상태',{exact:true}).filter({hasText:status===200?'authenticated':'anonymous'}).waitFor();}
/** Assert a failed write caused no business change in the real transaction fixture. */
async function rejectedWrite(page,csrf,expected=403) {const response=await request(page,protectedPath,'POST',csrf===undefined?{}:{'X-CSRF-Token':csrf});assert.equal(response.status,expected,'Protected write rejection');assert.equal((await control('stats')).writes,1,'Rejected write preserved DB');}

try {
  browser=await chromium.launch(options);const untrusted=await browser.newContext({ignoreHTTPSErrors:false});const untrustedPage=await untrusted.newPage();
  await assert.rejects(untrustedPage.goto(fixture.origin+'/__development/admin-auth'),error=>/ERR_CERT_AUTHORITY_INVALID/.test(error.message));await browser.close();browser=undefined;passed('CA absent: browser rejects certificate');
  stage='NSS trusted root installation';
  // Chromium M146 defaults to the new location, but honors an existing legacy DB.
  const legacy=join(homedir(),'.pki/nssdb');let database=join(homedir(),'.local/share/pki/nssdb');try {await access(legacy);database=legacy;}catch{/* Fresh image has no legacy store. */}
  await mkdir(database,{recursive:true});try {await access(join(database,'cert9.db'));}catch{execFileSync('certutil',['-d','sql:'+database,'-N','--empty-password']);}
  execFileSync('certutil',['-d','sql:'+database,'-A','-t','C,,','-n','Holdlog temporary integration root','-i','/fixture/root.pem']);
  browser=await chromium.launch(options);const context=await browser.newContext({ignoreHTTPSErrors:false,viewport:{width:1100,height:750}});
  const page=await open(context);const response=await page.goto(fixture.origin+'/__development/admin-auth');assert.equal(response.status(),200);assert.match((await response.securityDetails()).issuer,/Holdlog Administrator Integration Test Root/);passed('CA trusted: validated HTTPS chain and hostname');
  const mismatch=await context.newPage();const badHost=fixture.origin.replace('localhost','host.docker.internal');await assert.rejects(mismatch.goto(badHost+'/__development/admin-auth'),error=>/ERR_CERT_COMMON_NAME_INVALID/.test(error.message));await mismatch.close();passed('Hostname mismatch rejected with trusted CA');
  await page.getByLabel('세션 상태',{exact:true}).filter({hasText:'anonymous'}).waitFor();
  stage='real login and cookie reconstruction';
  const first=await login(page,fixture.password);const cookie=(await context.cookies()).find(value=>value.name==='holdlog_admin_session');
  privateValues.add(first.body.csrfToken);privateValues.add(cookie?.value??fixture.password);
  assert.ok(cookie,'Browser stored administrator cookie');assert.ok(cookie.secure&&cookie.httpOnly&&cookie.sameSite==='Lax'&&cookie.path==='/api/v2/admin'&&cookie.domain==='localhost','Cookie attributes');assert.ok(!/\bDomain=/i.test(first.headers['set-cookie']),'Host-only Set-Cookie');
  assert.deepEqual(Object.keys(first.body).sort(),['csrfToken','expiresAt','principalId']);assert.ok(!JSON.stringify(first.body).includes(cookie.value),'Cookie absent from JSON');assert.equal(first.requestHeaders.origin,fixture.origin,'Automatic login Origin');passed('Real login: browser cookie storage and attributes, no cookie in JSON');
  await check(page,200);const beforeReload=(await request(page,currentPath)).body;const beforeActivity=(await control('stats')).sessionRows.at(-1);await new Promise(resolve=>setTimeout(resolve,100));await page.reload();await page.getByLabel('세션 상태',{exact:true}).filter({hasText:'authenticated'}).waitFor();const afterReload=(await request(page,currentPath)).body;const afterActivity=(await control('stats')).sessionRows.at(-1);assert.ok(beforeReload.csrfToken===afterReload.csrfToken,'Stable session-bound CSRF');assert.equal(afterActivity.expires_at,beforeActivity.expires_at,'Absolute expiry not extended');assert.ok(Date.parse(afterActivity.last_activity_at)>Date.parse(beforeActivity.last_activity_at),'Idle activity advanced');assert.ok(Date.parse(afterReload.expiresAt)<Date.parse(afterActivity.expires_at),'Effective idle expiry below absolute expiry');passed('Provider reload reconstructs CSRF, advances idle activity, preserves absolute expiry');
  const privateView=await page.goto(fixture.origin+protectedPath);assert.equal(privateView.status(),200);assert.equal(await page.evaluate(()=>document.cookie),'','HttpOnly even on matching cookie path');await page.goto(fixture.origin+'/__development/admin-auth');await page.getByLabel('세션 상태',{exact:true}).filter({hasText:'authenticated'}).waitFor();
  const storage=await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}));assert.deepEqual(storage,{local:0,session:0});assert.ok(!(await page.locator('body').innerText()).includes(first.body.csrfToken),'CSRF absent from UI');passed('HttpOnly and memory-only authority: no storage or UI secret');
  await page.screenshot({path:'/evidence/authenticated.png'});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/evidence/mobile.png'});passed('Desktop and narrow viewport actual Provider');
  stage='protected writes and cookie path separation';
  const valid=await request(page,protectedPath,'POST',{'X-CSRF-Token':first.body.csrfToken});assert.equal(valid.status,200);assert.equal((await control('stats')).writes,1);passed('Synthetic protected write: browser Cookie+Origin+CSRF, real DB TX');
  await rejectedWrite(page,undefined);await rejectedWrite(page,'incorrect');passed('Missing and wrong CSRF:403, no DB write');
  const secondContext=await browser.newContext({ignoreHTTPSErrors:false}),secondPage=await open(secondContext);const second=await login(secondPage,fixture.password);await rejectedWrite(page,second.body.csrfToken);passed('Other session CSRF rejected:403, no DB write');
  const foreign=await open(context,fixture.foreignOrigin);await rejectedWrite(foreign,first.body.csrfToken);await foreign.close();passed('Real foreign browser Origin with automatic cookie rejected:403');
  const member=await request(page,'/api/v2/me','GET',{Authorization:'Bearer '+fixture.memberToken});assert.equal(member.status,200);assert.equal((await request(page,'/api/v2/me')).status,401);assert.equal((await request(page,'/api/v2/me','GET',{Authorization:'Bearer '+cookie.value},'omit')).status,401);passed('Member API requires member Bearer; administrator authority cannot substitute');
  assert.equal((await request(page,currentPath,'GET',{Authorization:'Bearer '+fixture.memberToken,'X-Role':'crew_admin','X-Principal-Id':first.body.principalId},'omit')).status,401);passed('Member Bearer and client crew-admin/principal claims grant no service-admin authority');
  const calls=(await control('stats')).observed;assert.ok(calls.some(value=>value.path===currentPath&&value.cookie),'Browser automatically sends matching-path cookie');assert.ok(calls.filter(value=>value.path==='/api/v2/me').every(value=>!value.cookie),'Browser omits administrator cookie outside path');assert.ok(calls.some(value=>value.path===protectedPath&&value.origin===fixture.foreignOrigin&&value.cookie),'Real foreign Origin reached server with browser cookie');passed('Cookie path and original browser Origin preserved through proxy');
  stage='password replacement and expiry';
  await control('replace');await check(page,401);await check(secondPage,401);await rejectedWrite(secondPage,second.body.csrfToken,401);passed('Actual bootstrap replacement revokes both browser sessions');
  const invalidContext=await browser.newContext({ignoreHTTPSErrors:false}),invalidPage=await open(invalidContext);await login(invalidPage,fixture.password,401);assert.equal((await invalidContext.cookies()).length,0);await invalidContext.close();passed('Old password rejected after CLI replacement');
  await login(page,fixture.replacement);await control('idle');await check(page,401);await rejectedWrite(page,first.body.csrfToken,401);passed('Real DB idle expiry: server401, Provider invalidation, no protected write');
  await login(page,fixture.replacement);await control('absolute');assert.ok((await context.cookies()).some(value=>value.name==='holdlog_admin_session'),'Browser cookie still exists for absolute expiry test');await check(page,401);await rejectedWrite(page,first.body.csrfToken,401);passed('Real DB absolute expiry rejected while browser cookie remains stored');
  await login(page,fixture.replacement);await control('inactive');await check(page,401);await rejectedWrite(page,first.body.csrfToken,401);await login(page,fixture.replacement,401);await control('active');passed('Inactive service principal loses sessions and cannot log in');
  stage='logout revocation and no secret exposure';
  await login(page,fixture.replacement);const revoked=page.waitForResponse(value=>value.url()===fixture.origin+currentPath&&value.request().method()==='DELETE');await page.getByRole('button',{name:'로그아웃 검사',exact:true}).click();const logoutResponse=await revoked;assert.equal(logoutResponse.status(),200);const cleared=(await logoutResponse.allHeaders())['set-cookie'];for(const attribute of ['Max-Age=0','Path=/api/v2/admin','HttpOnly','Secure','SameSite=Lax'])assert.ok(cleared.includes(attribute),'Logout cookie attributes');await page.getByLabel('세션 상태',{exact:true}).filter({hasText:'anonymous'}).waitFor();assert.ok(!(await context.cookies()).some(value=>value.name==='holdlog_admin_session'),'Logout removes cookie');await check(page,401);const stats=await control('stats');assert.ok(stats.sessionRows.at(-1).revoked_at,'Logout revocation persisted in DB');assert.equal(stats.writes,1);passed('Logout: real CSRF DELETE, matching cookie attributes/deletion, DB revocation, subsequent401');
  assert.equal(errors.length,0,'No page runtime errors');assert.equal(await page.locator('vite-error-overlay').count(),0);passed('Browser runtime errors0 and no Vite overlay');
  console.log(JSON.stringify({result:'passed',browser:await browser.version(),checks,checksPassed:checks.length,tlsBypass:false,trust:'Disposable Linux Chromium NSS root CA',db:'PostgreSQL17.11 isolated holdlog_test',writes:stats.writes,screenshots:['authenticated.png','mobile.png']}));
}catch(error){console.error(JSON.stringify({result:'failed',stage,category:error.code??error.name}));process.exitCode=1;}
finally {await browser?.close();}
