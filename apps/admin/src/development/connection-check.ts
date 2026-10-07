export type HealthTarget = 'live' | 'ready';
export type ConnectionResult =
  | { kind: 'connected'; target: HealthTarget }
  | { kind: 'database-unavailable'; target: 'ready' }
  | { kind: 'connection-failed'; target: HealthTarget }
  | { kind: 'invalid-response'; target: HealthTarget; httpStatus: number };

/** Check the exact foundation health body; ignore no additional fields or unexpected values. */
function hasStatus(value: unknown, status: string): boolean {
  return typeof value === 'object' && value !== null && Object.keys(value).length === 1 && 'status' in value && value.status === status;
}

/**
 * Call a relative development health path with a 5-second deadline and same-origin credentials.
 * Returns connection/DB/body failures without propagating raw response or network error details.
 * The injectable fetch is for isolated tests; it defaults to the browser fetch implementation.
 * This is a development module, not product readiness UI or an authentication shortcut.
 */
export async function checkDevelopmentConnection(target: HealthTarget = 'ready', fetcher: typeof fetch = globalThis.fetch): Promise<ConnectionResult> {
  let response: Response;
  try {
    response = await fetcher('/internal/health/' + target, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(5000) });
  } catch { return { kind: 'connection-failed', target }; }
  if (response.status === 502) return { kind: 'connection-failed', target };
  let body: unknown;
  try { body = await response.json(); }
  catch { return { kind: 'invalid-response', target, httpStatus: response.status }; }
  if (response.status === 200 && hasStatus(body, target === 'live' ? 'ok' : 'ready')) return { kind: 'connected', target };
  if (target === 'ready' && response.status === 503 && hasStatus(body, 'unavailable')) return { kind: 'database-unavailable', target };
  return { kind: 'invalid-response', target, httpStatus: response.status };
}
