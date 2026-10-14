import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, readFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as httpServer } from 'node:http';
import { once } from 'node:events';
import { request as httpsRequest } from 'node:https';
import { createServer as createVite } from 'vite';
import viteConfiguration from '../../apps/admin/vite.config.ts';
import { loadConfiguration, loadAdminIdentityConfiguration } from '../../apps/server/dist/src/config/environment.js';
import { createDatabase } from '../../apps/server/dist/src/database/pool.js';
import { migrate } from '../../apps/server/dist/src/database/migrate.js';
import { withTransaction } from '../../apps/server/dist/src/database/transaction.js';
import { createApplication } from '../../apps/server/dist/src/app.module.js';
import { AdminSessionService } from '../../apps/server/dist/src/modules/identity/admin-session.js';
import { administratorCookie } from '../../apps/server/dist/src/modules/identity/admin.controller.js';
import { issueSession } from '../../apps/server/dist/src/modules/identity/mobile-session.js';

const execute=promisify(execFile);
const root=fileURLToPath(new URL('../../',import.meta.url));
const docker=process.env.ADMIN_HTTPS_DOCKER??'docker';
const directory=await mkdtemp(join(tmpdir(),'holdlog-admin-https-'));
await chmod(directory,0o700);
const evidenceDirectory=await mkdtemp(join(tmpdir(),'holdlog-admin-https-evidence-'));
const browserFiles=join(directory,'browser');await mkdir(browserFiles,{mode:0o700});
const dbName='holdlog-admin-https-'+randomUUID();
let pool,app,mainVite,foreignVite,control,dbStarted=false,stage='prerequisites';
const password=randomBytes(32).toString('hex'),replacement=randomBytes(32).toString('hex'),dbPassword=randomBytes(32).toString('hex'),controlToken=randomBytes(32).toString('hex');
const loginId='browser-'+randomUUID(),memberId=randomUUID();
const key=randomBytes(32),adminSettings={csrfKey:key,allowedOrigins:[]};
let administratorId,writes=0;
const observed=[];

/** Execute bounded tooling without returning subprocess arguments, output or fixture secrets on failure. */
async function command(binary,args,options={}) {try{return await execute(binary,args,{timeout:120000,maxBuffer:4*1024*1024,...options});}catch{throw new Error('Verification prerequisite or subprocess failed');}}
/** Write private fixture files outside Git; neither input secrets nor CA private keys enter evidence. */
async function privateFile(path,text) {await writeFile(path,text,{mode:0o600});}
/** Generate a short-lived CA and server certificate; browser trust receives the public root only. */
async function certificates() {
  const caConfig=join(directory,'ca.cnf'),leafConfig=join(directory,'leaf.cnf');
  await privateFile(caConfig,'[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=Holdlog Administrator Integration Test Root\n[ext]\nbasicConstraints=critical,CA:true\nkeyUsage=critical,keyCertSign,cRLSign\n');
  await privateFile(leafConfig,'[req]\ndistinguished_name=dn\nprompt=no\n[dn]\nCN=localhost\n[ext]\nbasicConstraints=critical,CA:false\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:localhost,IP:127.0.0.1\n');
  await command('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',join(directory,'ca-key.pem'),'-out',join(browserFiles,'root.pem'),'-config',caConfig]);
  await command('openssl',['req','-new','-newkey','rsa:2048','-nodes','-keyout',join(directory,'key.pem'),'-out',join(directory,'leaf.csr'),'-config',leafConfig]);
  await command('openssl',['x509','-req','-days','1','-in',join(directory,'leaf.csr'),'-CA',join(browserFiles,'root.pem'),'-CAkey',join(directory,'ca-key.pem'),'-CAcreateserial','-out',join(directory,'cert.pem'),'-extfile',leafConfig,'-extensions','ext']);
  await chmod(join(directory,'key.pem'),0o600);await chmod(join(directory,'ca-key.pem'),0o600);
}
/** Exercise create-only/replacement using the actual hidden-input CLI in a real PTY. */
async function bootstrap(operation,secret,expected='completed') {
  const input=join(directory,'bootstrap.json');await privateFile(input,JSON.stringify({node:process.execPath,cli:join(root,'apps/server/dist/src/tools/admin-bootstrap.js'),loginId,password:secret,env:serverEnv}));
  await command('python3',[join(root,'scripts/verify-admin-https/bootstrap-pty.py'),input,operation,expected]);
}
/** Start the existing HTTPS development configuration with an ephemeral loopback port. */
async function startVite() {const config=viteConfiguration({command:'serve',mode:'development',isPreview:false});const server=await createVite({...config,configFile:false,server:{...config.server,port:0,strictPort:false}});await server.listen();return server;}
/** Run a TLS-verified wire fault case whose missing Origin cannot be produced by ordinary browser POST. */
async function missingOrigin(origin) {return new Promise((resolve,reject)=>{const body=JSON.stringify({loginId,password});const request=httpsRequest(new URL('/api/v2/admin/auth/sessions',origin),{method:'POST',ca:rootCertificate,headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),'Idempotency-Key':randomUUID()}},response=>{response.resume();response.on('end',()=>resolve(response.statusCode));});request.on('error',reject);request.end(body);});}

const serverEnv={NODE_ENV:'test',API_HOST:'127.0.0.1',API_PORT:'3100',PRIVATE_STORAGE_PATH:join(directory,'storage'),ALLOWED_ORIGINS:'http://localhost:5173',WORKER_QUEUE:'admin-browser-verification'};
let rootCertificate;
try {
  await command(docker,['image','inspect','holdlog-57-browser']);
  stage='isolated test DB';
  const dbEnv=join(directory,'db.env');await privateFile(dbEnv,'POSTGRES_DB=holdlog_test\nPOSTGRES_USER=holdlog\nPOSTGRES_PASSWORD='+dbPassword+'\n');
  await command(docker,['run','-d','--name',dbName,'--env-file',dbEnv,'-p','127.0.0.1::5432','postgres:17.11']);dbStarted=true;
  const port=Number(JSON.parse((await command(docker,['inspect',dbName])).stdout)[0].NetworkSettings.Ports['5432/tcp'][0].HostPort);
  serverEnv.DATABASE_URL='postgres://holdlog:'+dbPassword+'@127.0.0.1:'+port+'/holdlog_test';
  for(let attempt=0;attempt<80;attempt++){try {await command(docker,['exec',dbName,'pg_isready','-U','holdlog','-d','holdlog_test']);break;}catch{if(attempt===79)throw new Error('Test DB readiness deadline');await new Promise(resolve=>setTimeout(resolve,250));}}
  pool=createDatabase(loadConfiguration(serverEnv));await migrate(pool);
  stage='bootstrap PTY';await bootstrap('create',password);await bootstrap('create',password,'ALREADY_EXISTS');
  administratorId=(await pool.query('SELECT id FROM holdlog.service_administrators WHERE login_id=$1',[loginId])).rows[0].id;
  await pool.query('CREATE TABLE holdlog.admin_browser_verification_writes (id integer PRIMARY KEY, value integer NOT NULL); INSERT INTO holdlog.admin_browser_verification_writes VALUES (1,0)');
  // Seed only an isolated ordinary member; provider authentication is outside administrator integration.
  const member=await withTransaction(pool,async client=>{await client.query('INSERT INTO holdlog.accounts(id,display_name) VALUES ($1,$2)',[memberId,'Integration member']);await client.query('INSERT INTO holdlog.external_identities(account_id,provider,provider_subject) VALUES ($1,$2,$3)',[memberId,'google','integration-'+randomUUID()]);return issueSession(client,memberId,randomUUID());});
  stage='real API and HTTPS proxy';
  app=await createApplication(loadConfiguration(serverEnv),{verify:()=>Promise.reject(new Error('Provider verification outside this check'))},adminSettings);
  const express=app.getHttpAdapter().getInstance(),service=new AdminSessionService(pool,adminSettings);
  express.use((request,_response,next)=>{if(request.url?.startsWith('/api/v2/'))observed.push({path:request.url.split('?')[0],method:request.method,cookie:Boolean(request.headers.cookie?.includes('holdlog_admin_session=')),origin:request.headers.origin??null,csrf:Boolean(request.headers['x-csrf-token'])});next();});
  // This probe is registered only in this test process; it is not a product006/019 controller.
  express.all('/api/v2/admin/__verification/protected',async(request,response)=>{try {const value=await service.withAdministrator(administratorCookie(request),request.method==='GET'?undefined:{origin:request.headers.origin,csrf:request.headers['x-csrf-token']},async client=>{if(request.method!=='GET')await client.query('UPDATE holdlog.admin_browser_verification_writes SET value=value+1 WHERE id=1');return {authorized:true};});response.setHeader('Cache-Control','no-store');response.json(value);}catch(error){response.status(error.status??503).json({code:error.code??'TEMPORARY_FAILURE'});}});
  await app.listen(0,'127.0.0.1');
  await certificates();rootCertificate=await readFile(join(browserFiles,'root.pem'));
  Object.assign(process.env,{ADMIN_DEV_API_ORIGIN:await app.getUrl(),ADMIN_DEV_AUTH_CHECK:'true',ADMIN_DEV_TLS_CERT:join(directory,'cert.pem'),ADMIN_DEV_TLS_KEY:join(directory,'key.pem')});
  mainVite=await startVite();foreignVite=await startVite();
  const origin=mainVite.resolvedUrls.local[0].replace('127.0.0.1','localhost').replace(/\/$/,'');
  const foreignOrigin=foreignVite.resolvedUrls.local[0].replace('127.0.0.1','localhost').replace(/\/$/,'');
  adminSettings.allowedOrigins.push(...loadAdminIdentityConfiguration({ADMIN_CSRF_KEY:key.toString('base64'),ADMIN_ALLOWED_ORIGINS:origin}).allowedOrigins);
  assert.equal(await missingOrigin(origin),403,'Missing Origin must fail on a verified TLS connection');
  /** Expose fixed fixture actions to the Node test runner only, authenticated separately from product cookies. */
  control=httpServer(async(request,response)=>{try {if(request.headers.authorization!=='Bearer '+controlToken){response.writeHead(403).end();return;}let body='';for await(const chunk of request)body+=chunk;if(body.length>256)throw new Error('Fixture action limit');const {action}=JSON.parse(body);let result={};
    if(action==='replace')await bootstrap('replace',replacement);
    else if(action==='idle')await pool.query("UPDATE holdlog.admin_sessions SET last_activity_at=statement_timestamp()-interval '31 minutes' WHERE administrator_id=$1",[administratorId]);
    else if(action==='absolute')await pool.query("UPDATE holdlog.admin_sessions SET created_at=statement_timestamp()-interval '9 hours',expires_at=statement_timestamp()-interval '1 second',last_activity_at=statement_timestamp() WHERE administrator_id=$1",[administratorId]);
    else if(action==='inactive'||action==='active')await pool.query('UPDATE holdlog.service_administrators SET active=$2 WHERE id=$1',[administratorId,action==='active']);
    else if(action==='stats'){writes=(await pool.query('SELECT value FROM holdlog.admin_browser_verification_writes WHERE id=1')).rows[0].value;result={writes,observed,sessionRows:(await pool.query('SELECT created_at,last_activity_at,expires_at,revoked_at FROM holdlog.admin_sessions WHERE administrator_id=$1 ORDER BY created_at',[administratorId])).rows};}
    else throw new Error('Unknown fixture action');response.setHeader('Content-Type','application/json');response.end(JSON.stringify(result));
  }catch{response.writeHead(500).end('Fixture action failed');}});
  control.listen(0,'127.0.0.1');await once(control,'listening');
  await privateFile(join(browserFiles,'input.json'),JSON.stringify({origin,foreignOrigin,loginId,password,replacement,memberToken:member.accessToken,controlUrl:'http://host.docker.internal:'+control.address().port,controlToken}));
  stage='trusted Chromium browser';
  const result=await command(docker,['run','--rm','--cap-drop','ALL','--cap-add','DAC_OVERRIDE','--security-opt','no-new-privileges','--shm-size','256m','--mount','type=bind,src='+browserFiles+',dst=/fixture,readonly','--mount','type=bind,src='+join(root,'scripts/verify-admin-https')+',dst=/checks,readonly','--mount','type=bind,src='+evidenceDirectory+',dst=/evidence','holdlog-57-browser','node','/checks/browser.mjs']);
  const evidence=JSON.parse(result.stdout.trim().split('\n').at(-1));
  assert.equal(evidence.result,'passed');
  assert.ok([password,replacement,dbPassword,controlToken,member.accessToken].every(value=>!result.stdout.includes(value)),'Evidence contains no private fixture values');
  await writeFile(join(evidenceDirectory,'result.json'),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify({...evidence,evidenceDirectory,bootstrap:'real CLI PTY create, duplicate, replace; no echo; terminal restored',missingOriginWire403:true,providerAuthentication:'not exercised; isolated member session fixture',productWrites:'synthetic protected transaction only;006/019 unimplemented'}));
} catch(error) {console.error(JSON.stringify({result:'failed',stage,category:error.code??error.name}));process.exitCode=1;}
finally {
  await mainVite?.close();await foreignVite?.close();
  if(control?.listening){const closed=once(control,'close');control.close();await closed;}
  await app?.close();await pool?.end();
  if(dbStarted)await command(docker,['rm','-f',dbName]);
  await rm(directory,{recursive:true,force:true});
}
