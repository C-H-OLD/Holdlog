import { fileURLToPath } from 'node:url';
import { createLogger, defineConfig, loadEnv, type Logger } from 'vite';
import react from '@vitejs/plugin-react';
import { readDevelopmentOrigin,readAdministratorDevelopmentOrigin } from './node-checks/development-origin.ts';
import { readDevelopmentHttps } from './node-checks/development-https.ts';
import { adminAuthDevelopmentPlugin } from './node-checks/admin-auth-development.ts';

/** Redact Vite proxy errors, which otherwise include the request URL and raw error stack. */
function developmentLogger(): Logger {
  const logger = createLogger();
  const originalError = logger.error.bind(logger);
  logger.error = (message, options) => {
    if (message.includes('proxy error:') || message.includes('proxy socket error:')) originalError('Development API connection failed');
    else originalError(message, options);
  };
  return logger;
}

/** Configure loopback-only React tooling; development requires a valid proxy origin and never exposes custom env values. */
export default defineConfig(({ command, isPreview, mode }) => {
  const root = fileURLToPath(new URL('.', import.meta.url));
  const development=command==='serve'&&!isPreview;
  const env=development?loadEnv(mode,root,'ADMIN_DEV_'):{};
  const https=development?readDevelopmentHttps(env):undefined;
  if(https&&mode!=='development')throw new Error('Unavailable setting: ADMIN_DEV_AUTH_CHECK');
  const proxy=development?{target:readDevelopmentOrigin(env),changeOrigin:false}:undefined;
  let administratorProxy: typeof proxy;
  if(proxy){
    try {administratorProxy={target:readAdministratorDevelopmentOrigin(env),changeOrigin:false};}
    catch(error){if(https)throw error;}
  }
  return {
    root,
    plugins: [react(),adminAuthDevelopmentPlugin(Boolean(https),Boolean(administratorProxy))],
    // No custom environment value is exposed to client modules at this foundation stage.
    envPrefix: [],
    customLogger: developmentLogger(),
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      ...(https?{https}:{}),
      ...(proxy ? { proxy: { ...(administratorProxy?{'^/api/v2(?:/|$)':administratorProxy}:{}), '^/internal/health/(?:live|ready)(?:\\?|$)': {
        ...proxy,
        configure(proxyServer) {
          proxyServer.on('proxyReq', request => {
            for(const header of ['cookie','x-csrf-token','authorization'])request.removeHeader(header);
          });
        },
      } } } : {}),
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true },
  };
});
