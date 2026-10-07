import { loadConfiguration, type Configuration } from '../src/config/environment.js';

/** Require an explicitly supplied local test DB; a missing DB must fail rather than skip. */
export function integrationConfiguration(): Configuration {
  return loadConfiguration({ NODE_ENV: 'test', API_HOST: '127.0.0.1', API_PORT: '3100', DATABASE_URL: process.env.TEST_DATABASE_URL, PRIVATE_STORAGE_PATH: '/tmp/holdlog-test-storage', ALLOWED_ORIGINS: 'http://localhost:5173', WORKER_QUEUE: 'foundation-check' });
}
