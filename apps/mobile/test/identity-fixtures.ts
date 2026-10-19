import type { components } from '@holdlog/contracts/http';

export const deviceId = '123e4567-e89b-42d3-a456-426614174000';
export const accountId = '123e4567-e89b-42d3-a456-426614174001';
export const now = Date.parse('2026-10-19T00:00:00Z');
/** Create a closed contract fixture with tokens that have no external authority. */
export function session(overrides: Partial<components['schemas']['MobileSession']> = {}): components['schemas']['MobileSession'] {
  return { accessToken: 'fixture-access', refreshToken: 'fixture-refresh', accessExpiresAt: '2026-10-19T00:30:00Z', refreshExpiresAt: '2026-11-19T00:00:00Z', profile: { id: accountId, name: 'Climber', photoFileId: null, version: 1, identity: { provider: 'google', email: null } }, ...overrides };
}
/** Control delayed storage/network completion without sleeps. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
