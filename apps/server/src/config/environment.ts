import { isAbsolute } from 'node:path';
import { isIP } from 'node:net';
import { createPrivateKey, type KeyObject } from 'node:crypto';
import { readFileSync } from 'node:fs';

export interface IdentityConfiguration {
  google: { audiences: string[]; issuers: string[]; jwksUrl: string };
  apple: { audiences: string[]; issuer: string; jwksUrl: string; teamId: string; keyId: string; privateKey: KeyObject };
  admin: { csrfKey: Buffer; allowedOrigins: string[] };
}

/**
 * Validate mobile provider settings before enabling their endpoints. Foundation health/worker need no provider secrets.
 * Reads a local Apple P-256 PEM key and exact audiences; returns server-only provider configuration.
 * Provider issuers/JWKS are fixed trusted endpoints, independent of token headers or environment URL overrides.
 * Throws only setting names on missing/unsafe values, unreadable keys or an unsupported key algorithm.
 */
export function loadMobileIdentityConfiguration(env: NodeJS.ProcessEnv = process.env): Omit<IdentityConfiguration, 'admin'> {
  const invalid = new Set<string>();
  /** Validate exact audience lists without silently filtering empty or duplicate entries. */
  function audiences(name: string): string[] {
    const values = (env[name] ?? '').split(',').map(value => value.trim());
    if (values.some(value => !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) || new Set(values).size !== values.length) invalid.add(name);
    return values;
  }
  const googleAudiences = audiences('GOOGLE_CLIENT_IDS');
  const appleAudiences = audiences('APPLE_CLIENT_IDS');
  if (!/^[A-Z0-9]{10}$/.test(env.APPLE_TEAM_ID ?? '')) invalid.add('APPLE_TEAM_ID');
  if (!/^[A-Z0-9]{10}$/.test(env.APPLE_KEY_ID ?? '')) invalid.add('APPLE_KEY_ID');
  let privateKey: KeyObject | undefined;
  try {
    if (!isAbsolute(env.APPLE_PRIVATE_KEY_PATH ?? '')) throw new Error('Invalid key path');
    privateKey = createPrivateKey({ key: readFileSync(env.APPLE_PRIVATE_KEY_PATH!), format: 'pem', type: 'pkcs8' });
    if (privateKey.asymmetricKeyType !== 'ec' || privateKey.asymmetricKeyDetails?.namedCurve !== 'prime256v1') throw new Error('Invalid key type');
  } catch { invalid.add('APPLE_PRIVATE_KEY_PATH'); }
  if (invalid.size) throw new Error('Missing or invalid settings: ' + [...invalid].join(', '));
  return {
    google: { audiences: googleAudiences, issuers: ['https://accounts.google.com', 'accounts.google.com'], jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs' },
    apple: { audiences: appleAudiences, issuer: 'https://appleid.apple.com', jwksUrl: 'https://appleid.apple.com/auth/keys', teamId: env.APPLE_TEAM_ID!, keyId: env.APPLE_KEY_ID!, privateKey: privateKey! },
  };
}

/**
 * Load only administrator CSRF/HTTPS-origin settings without requiring mobile provider credentials.
 * Returns secret key bytes and an exact origin allowlist; never log/serialize the result.
 * Throws setting names only for missing/invalid keys, non-HTTPS URLs or origin paths/credentials.
 */
export function loadAdminIdentityConfiguration(env: NodeJS.ProcessEnv = process.env): IdentityConfiguration['admin'] {
  const invalid = new Set<string>();
  const csrfKey = Buffer.from(env.ADMIN_CSRF_KEY ?? '', 'base64');
  if (csrfKey.length !== 32 || csrfKey.toString('base64') !== env.ADMIN_CSRF_KEY) invalid.add('ADMIN_CSRF_KEY');
  const origins = (env.ADMIN_ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim());
  for (const origin of origins) {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password) invalid.add('ADMIN_ALLOWED_ORIGINS');
    } catch { invalid.add('ADMIN_ALLOWED_ORIGINS'); }
  }
  if (new Set(origins).size !== origins.length) invalid.add('ADMIN_ALLOWED_ORIGINS');
  if (invalid.size) throw new Error('Missing or invalid settings: ' + [...invalid].join(', '));
  return { csrfKey, allowedOrigins: origins };
}

/**
 * Load mobile and administrator settings from env, returning their combined server-only secret configuration.
 * Throws setting-name validation errors from either loader. Narrow entrypoints can load only their own settings.
 */
export function loadIdentityConfiguration(env: NodeJS.ProcessEnv = process.env): IdentityConfiguration {
  return { ...loadMobileIdentityConfiguration(env), admin: loadAdminIdentityConfiguration(env) };
}

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
