import { isAbsolute } from 'node:path';
import { isIP } from 'node:net';

export interface Configuration {
  environment: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databaseUrl: string;
  storagePath: string;
  allowedOrigins: string[];
  queue: string;
}

/** Recognize loopback and private IPv4 addresses; wildcard binds are deliberately refused. */
function isLocalHost(host: string): boolean {
  if (host === 'localhost' || host === '::1' || host === '[::1]') return true;
  if (isIP(host) !== 4) return false;
  const parts = host.split('.').map(Number);
  return parts[0] === 127 || parts[0] === 10 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31);
}

/**
 * Validate foundation settings before opening sockets. Input is process.env by default.
 * Returns validated local configuration; throws names only on missing/invalid settings.
 * Production may be used to verify disabled development routes, with local data only.
 */
export function loadConfiguration(env: NodeJS.ProcessEnv = process.env): Configuration {
  const required = ['NODE_ENV', 'API_HOST', 'API_PORT', 'DATABASE_URL', 'PRIVATE_STORAGE_PATH', 'ALLOWED_ORIGINS', 'WORKER_QUEUE'] as const;
  const invalid = new Set<string>();
  for (const name of required) if (!env[name]?.trim()) invalid.add(name);
  const environment = env.NODE_ENV;
  if (!['development', 'test', 'production'].includes(environment ?? '')) invalid.add('NODE_ENV');
  const host = env.API_HOST ?? '';
  if (!isLocalHost(host) || host === 'localhost' || host === '[::1]') invalid.add('API_HOST');
  const port = Number(env.API_PORT);
  if (!/^\d+$/.test(env.API_PORT ?? '') || !Number.isInteger(port) || port < 1 || port > 65535) invalid.add('API_PORT');
  try {
    const url = new URL(env.DATABASE_URL ?? '');
    // Foundation refuses remote/operational databases even in a production-mode smoke test.
    const expectedDatabase = environment === 'test' ? '/holdlog_test' : '/holdlog_dev';
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !isLocalHost(url.hostname) || url.pathname !== expectedDatabase || !url.username || !url.password || url.search || url.hash) invalid.add('DATABASE_URL');
  } catch { invalid.add('DATABASE_URL'); }
  if (!isAbsolute(env.PRIVATE_STORAGE_PATH ?? '')) invalid.add('PRIVATE_STORAGE_PATH');
  const origins = (env.ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim());
  for (const origin of origins) {
    try { const url = new URL(origin); if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin || url.username || url.password) invalid.add('ALLOWED_ORIGINS'); }
    catch { invalid.add('ALLOWED_ORIGINS'); }
  }
  if (!/^[a-z][a-z0-9-]{0,62}$/.test(env.WORKER_QUEUE ?? '')) invalid.add('WORKER_QUEUE');
  if (invalid.size) throw new Error('Missing or invalid settings: ' + [...invalid].join(', '));
  return { environment: environment as Configuration['environment'], host, port, databaseUrl: env.DATABASE_URL!, storagePath: env.PRIVATE_STORAGE_PATH!, allowedOrigins: origins, queue: env.WORKER_QUEUE! };
}
