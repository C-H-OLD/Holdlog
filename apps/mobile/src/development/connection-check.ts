export type HealthTarget = 'live' | 'ready';
export type ConnectionResult =
  | { kind: 'connected'; target: HealthTarget }
  | { kind: 'database-unavailable'; target: 'ready' }
  | { kind: 'connection-failed'; target: HealthTarget }
  | { kind: 'invalid-response'; target: HealthTarget; httpStatus: number };

/** Accept only the exact001 body, without extra fields or silently coercing values. */
function hasStatus(value: unknown, status: string): boolean {
  return typeof value === 'object' && value !== null && Object.keys(value).length === 1 && 'status' in value && value.status === status;
}
/**
 * Request the given development origin's health route, with a 5-second deadline covering body consumption.
 * The platform host comes from validated public configuration; injectable fetch supports isolated tests.
 * Returns success, DB unavailable, transport failure or invalid response without exposing raw errors/body.
 * Sends no product credentials and clears its timer on every result. This does not verify product APIs.
 */
export async function checkDevelopmentConnection(origin: string, target: HealthTarget = 'ready', fetcher: typeof fetch = globalThis.fetch): Promise<ConnectionResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    let response: Response;
    try { response = await fetcher(origin + '/internal/health/' + target, { credentials: 'omit', headers: { 'Cache-Control': 'no-cache' }, signal: controller.signal }); }
    catch { return { kind: 'connection-failed', target }; }
    let body: unknown;
    try { body = await response.json(); }
    catch { return controller.signal.aborted ? { kind: 'connection-failed', target } : { kind: 'invalid-response', target, httpStatus: response.status }; }
    if (response.status === 200 && hasStatus(body, target === 'live' ? 'ok' : 'ready')) return { kind: 'connected', target };
    if (target === 'ready' && response.status === 503 && hasStatus(body, 'unavailable')) return { kind: 'database-unavailable', target };
    return { kind: 'invalid-response', target, httpStatus: response.status };
  } finally { clearTimeout(timer); }
}
