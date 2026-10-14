import type { Plugin } from 'vite';
const route='/__development/admin-auth';
const modulePath='/src/development/admin-auth-check.ts';

/** Serve the development authentication harness only on explicitly configured HTTPS; builds/previews have no entry. */
export function adminAuthDevelopmentPlugin(enabled:boolean,allowApi:boolean):Plugin {
  return {name:'holdlog-admin-auth-development',apply:'serve',configureServer(server){
    server.middlewares.use((request,response,next)=>{
      const path=(request.url??'').split('?')[0];
      if(!allowApi&&/^\/api\/v2(?:\/|$)/.test(path??'')){response.setHeader('Cache-Control','no-store');response.statusCode=503;response.end('Development administrator transport unavailable');return;}
      if(path!==route&&path!==modulePath){next();return;}
      response.setHeader('Cache-Control','no-store');response.setHeader('Referrer-Policy','no-referrer');
      if(!enabled){response.statusCode=404;response.end('Development authentication check unavailable');return;}
      if(path===modulePath){next();return;}
      response.setHeader('Content-Type','text/html; charset=utf-8');
      const html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Holdlog 개발 관리자 인증 검사</title><link rel="icon" href="data:,"></head><body><div id="admin-auth-check"></div><script type="module" src="'+modulePath+'"></script></body></html>';
      void server.transformIndexHtml(route,html).then(transformed=>{response.end(transformed);},()=>{response.statusCode=500;response.end('Development check unavailable');});
    });
  }};
}
