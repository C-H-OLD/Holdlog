import { isIP } from 'node:net';

/** Determine whether an origin points to loopback or an explicit private development address. */
function isDevelopmentHost(host: string): boolean {
  if (host === 'localhost' || host === '[::1]') return true;
  if (isIP(host) !== 4) return false;
  const parts = host.split('.').map(Number);
  return parts[0] === 127 || parts[0] === 10 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31);
}

/**
 * Read the Node-only proxy origin. Throws its setting name on missing/unsafe values.
 * Rejects credentials, paths, query/hash and public hosts; never logs an input value.
 */
export function readDevelopmentOrigin(env: Record<string, string | undefined>): string {
  const value = env.ADMIN_DEV_API_ORIGIN;
  try {
    const url = new URL(value ?? '');
    if (!['http:', 'https:'].includes(url.protocol) || !isDevelopmentHost(url.hostname) || url.username || url.password || url.search || url.hash || url.origin !== value) throw new Error('Invalid origin');
    return url.origin;
  } catch { throw new Error('Missing or invalid setting: ADMIN_DEV_API_ORIGIN'); }
}
