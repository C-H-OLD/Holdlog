import { fileURLToPath } from 'node:url';
import { createLogger, defineConfig, loadEnv, type Logger } from 'vite';
import react from '@vitejs/plugin-react';
import { readDevelopmentOrigin } from './node-checks/development-origin.ts';

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
  const proxy = command === 'serve' && !isPreview
    ? { target: readDevelopmentOrigin(loadEnv(mode, root, 'ADMIN_DEV_')), changeOrigin: false }
    : undefined;
  return {
    root,
    plugins: [react()],
    // No custom environment value is exposed to client modules at this foundation stage.
    envPrefix: [],
    customLogger: developmentLogger(),
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      ...(proxy ? { proxy: { '^/api/v1(?:/|$)': proxy, '^/internal/health/(?:live|ready)(?:\\?|$)': proxy } } : {}),
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true },
  };
});
