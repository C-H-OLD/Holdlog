import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp,readFile,writeFile,rm,chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createServer as createHttpServer } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { once } from 'node:events';
import { createServer,type ViteDevServer } from 'vite';
import configuration from '../vite.config.ts';
import { readDevelopmentHttps } from '../node-checks/development-https.ts';

/** Generate a private temporary certificate fixture; trust is scoped to this test's HTTPS client. */
async function certificate() {
  const directory=await mkdtemp(join(tmpdir(),'holdlog-admin-tls-'));const cert=join(directory,'cert.pem'),key=join(directory,'key.pem'),config=join(directory,'openssl.cnf');
  await writeFile(config,'[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=localhost\n[ext]\nsubjectAltName=DNS:localhost,IP:127.0.0.1\n');
  try {execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',key,'-out',cert,'-config',config],{stdio:'ignore'});await chmod(key,0o600);return {directory,cert,key};}
  catch(error){await rm(directory,{recursive:true});if(error&&typeof error==='object'&&'code' in error&&error.code==='ENOENT')throw new Error('HTTPS tests require OpenSSL on PATH',{cause:error});throw error;}
}

void test('HTTPS opt-in rejects partial, invalid and mismatched private settings without revealing values',async()=>{
  assert.equal(readDevelopmentHttps({}),undefined);
  for(const env of [{ADMIN_DEV_AUTH_CHECK:'invalid'},{ADMIN_DEV_TLS_KEY:'/synthetic-secret'},{ADMIN_DEV_AUTH_CHECK:'true'},{ADMIN_DEV_AUTH_CHECK:'true',ADMIN_DEV_TLS_CERT:'relative',ADMIN_DEV_TLS_KEY:'relative'}]) assert.throws(()=>readDevelopmentHttps(env),error=>error instanceof Error&&!error.message.includes('synthetic-secret')&&!error.message.includes('relative'));
  const first=await certificate(),second=await certificate();
  try {assert.ok(readDevelopmentHttps({ADMIN_DEV_AUTH_CHECK:'true',ADMIN_DEV_TLS_CERT:first.cert,ADMIN_DEV_TLS_KEY:first.key}));assert.throws(()=>readDevelopmentHttps({ADMIN_DEV_AUTH_CHECK:'true',ADMIN_DEV_TLS_CERT:first.cert,ADMIN_DEV_TLS_KEY:second.key}));}
  finally {await rm(first.directory,{recursive:true});await rm(second.directory,{recursive:true});}
});

void test('real HTTPS Vite proxy preserves admin Origin, Cookie, CSRF, Set-Cookie attributes and path',async()=>{
  const fixture=await certificate(),names=['ADMIN_DEV_API_ORIGIN','ADMIN_DEV_AUTH_CHECK','ADMIN_DEV_TLS_CERT','ADMIN_DEV_TLS_KEY'],previous=names.map(name=>process.env[name]);let vite:ViteDevServer|undefined;
  const upstream=createHttpServer((request,response)=>{response.setHeader('Content-Type','application/json');response.setHeader('Set-Cookie','synthetic=1; Path=/api/v2/admin; HttpOnly; Secure; SameSite=Lax');response.end(JSON.stringify({path:request.url,origin:request.headers.origin,cookie:request.headers.cookie,csrf:request.headers['x-csrf-token']}));});
  try {
    upstream.listen(0,'127.0.0.1');await once(upstream,'listening');const address=upstream.address();assert.ok(address&&typeof address!=='string');Object.assign(process.env,{ADMIN_DEV_API_ORIGIN:'http://127.0.0.1:'+address.port,ADMIN_DEV_AUTH_CHECK:'true',ADMIN_DEV_TLS_CERT:fixture.cert,ADMIN_DEV_TLS_KEY:fixture.key});
    const config=configuration({command:'serve',mode:'development',isPreview:false});vite=await createServer({...config,configFile:false,server:{...config.server,port:0,strictPort:false}});await vite.listen();const origin=vite.resolvedUrls?.local[0];assert.ok(origin);assert.ok(origin.startsWith('https://'));
    /** Trust only the synthetic CA for this one request, leaving TLS verification enabled. */
    const ca=await readFile(fixture.cert);
    function request(path:string,headers:Record<string,string>={}) {return new Promise<{status:number;body:string;cookie:string[]|undefined}>((resolve,reject)=>{const req=httpsRequest(new URL(path,origin),{ca,headers},response=>{let body='';response.on('data',(chunk:Buffer)=>{body+=chunk.toString();});response.on('end',()=>{resolve({status:response.statusCode!,body,cookie:response.headers['set-cookie']});});});req.on('error',reject);req.end();});}
    const result=await request('/api/v2/admin/check?fixture=1',{Origin:new URL(origin).origin,Cookie:'synthetic=1','X-CSRF-Token':'synthetic-csrf'});assert.deepEqual(JSON.parse(result.body),{path:'/api/v2/admin/check?fixture=1',origin:new URL(origin).origin,cookie:'synthetic=1',csrf:'synthetic-csrf'});assert.match(result.cookie![0]!,/Path=\/api\/v2\/admin; HttpOnly; Secure; SameSite=Lax/);
    const page=(await request('/__development/admin-auth')).body;assert.match(page,/admin-auth-check\.ts/);assert.match(page,/@vite\/client/);assert.match(page,/@react-refresh/);assert.equal((await request('/src/development/admin-auth-check.ts')).status,200);
  } finally {await vite?.close();if(upstream.listening){const closed=once(upstream,'close');upstream.close();await closed;}names.forEach((name,index)=>{if(previous[index]===undefined)delete process.env[name];else process.env[name]=previous[index];});await rm(fixture.directory,{recursive:true});}
});
