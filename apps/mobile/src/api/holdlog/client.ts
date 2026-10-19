import type { components } from '@holdlog/contracts/http';
import type { OperationChecks } from '@holdlog/contracts/mobile-identity-checks';
import { isLocalHost } from '../../../configuration/development-origin.cjs';

export type MobileIdentityErrorKind = 'input' | 'contract' | 'http' | 'network' | 'timeout' | 'cancelled' | 'stale' | 'storage' | 'cleanup' | 'reauthenticate' | 'unavailable';
type ContractError = components['schemas']['Error'];
type ErrorMetadata = Pick<ContractError, 'fieldErrors' | 'currentVersion' | 'retryable'>;
const safePaths = new Set(['/name', '/photoFileId', '/signupToken', '/deviceId', '/provider', '/idToken', '/authorizationCode', '/challengeId', '/refreshToken', '/body', '/Idempotency-Key', '/If-Match']);

/** A fixed public failure that never stores raw response bodies, credentials, causes or exception messages. */
export class MobileIdentityError extends Error {
  readonly kind: MobileIdentityErrorKind;
  readonly status: number | null;
  readonly code: ContractError['code'] | null;
  readonly fieldErrors?: ContractError['fieldErrors'];
  readonly currentVersion?: number | null;
  readonly retryable?: boolean;
  /**
   * Describe a transport/session failure using a fixed message and optional validated public metadata.
   * Metadata is copied and field diagnostics are allowlisted; no submitted values or underlying errors are retained.
   */
  constructor(kind: MobileIdentityErrorKind, status: number | null = null, code: ContractError['code'] | null = null, metadata?: ErrorMetadata) {
    super('Mobile identity operation failed.');
    this.name = 'MobileIdentityError'; this.kind = kind; this.status = status; this.code = code;
    if (metadata) {
      this.fieldErrors = metadata.fieldErrors.filter(field => safePaths.has(field.path) && field.code === 'INVALID_INPUT').map(field => ({ path: field.path, code: 'INVALID_INPUT' }));
      this.currentVersion = metadata.currentVersion; this.retryable = metadata.retryable;
    }
  }
}

export interface MobileClientOptions { baseUrl: string; fetch: typeof fetch; timeoutMs?: number }
export interface MobileRequestOptions { body?: unknown; key?: string; accessToken?: string; version?: number; signal?: AbortSignal; profile?: boolean }
export interface MobileClient { request<T>(checks: OperationChecks, options?: MobileRequestOptions): Promise<T> }

/** Require HTTPS outside the shared literal development-host policy and validate the finite request deadline. */
function configuration(options: MobileClientOptions): { origin: string; timeoutMs: number } {
  try {
    if (!/^https?:\/\/[^/?#]+\/?$/.test(options.baseUrl)) throw new MobileIdentityError('input');
    const url = new URL(options.baseUrl);
    if (url.protocol === 'http:' && !isLocalHost(url.hostname)) throw new MobileIdentityError('input');
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || typeof options.fetch !== 'function') throw new MobileIdentityError('input');
    const timeoutMs = options.timeoutMs ?? 15000;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new MobileIdentityError('input');
    return { origin: url.origin, timeoutMs };
  } catch { throw new MobileIdentityError('input'); }
}

/** Prepare only contract headers and validate bodies/parameters before fetch can observe any input. */
function requestInit(checks: OperationChecks, options: MobileRequestOptions): RequestInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.key !== undefined) headers['Idempotency-Key'] = options.key;
  if (options.version !== undefined) {
    if (!Number.isSafeInteger(options.version) || options.version < 1) throw new MobileIdentityError('input');
    headers['If-Match'] = '"' + String(options.version) + '"';
  }
  for (const parameter of checks.parameters) {
    const value = headers[parameter.name];
    if ((value === undefined && parameter.required) || (value !== undefined && !parameter.validator(value))) throw new MobileIdentityError('input');
  }
  if (options.accessToken !== undefined) {
    if (!/^[A-Za-z0-9\-._~+/]+=*$/.test(options.accessToken)) throw new MobileIdentityError('input');
    headers.Authorization = 'Bearer ' + options.accessToken;
  }
  const init: RequestInit & { redirect: 'error' } = { method: checks.method.toUpperCase(), headers, credentials: 'omit', redirect: 'error' };
  const bodyCheck = checks.body['application/json'];
  if (bodyCheck) {
    if (!bodyCheck.validator(options.body)) throw new MobileIdentityError('input');
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  } else if (options.body !== undefined) throw new MobileIdentityError('input');
  return init;
}

/** Validate exact success status, all declared response headers and generated JSON before exposing a typed result. */
async function consume<T>(response: Response, checks: OperationChecks, options: MobileRequestOptions): Promise<T> {
  const status = response.status;
  const success = checks.responses[String(status)];
  if (status >= 200 && status < 300 && !success) throw new MobileIdentityError('contract', status);
  let body: unknown;
  try { body = await response.json(); } catch { throw new MobileIdentityError('contract', status); }
  const validator = (success ?? checks.responses.default)?.['application/json']?.validator;
  if (!validator || !validator(body)) throw new MobileIdentityError('contract', status);
  for (const [name, check] of Object.entries(checks.responseHeaders[String(status)] ?? {})) {
    const value = response.headers.get(name);
    if (value !== null && !check(value)) throw new MobileIdentityError('contract', status);
  }
  if (!success) {
    const error = body as ContractError;
    throw new MobileIdentityError('http', status, error.code, error);
  }
  if (options.profile) {
    const profile = body as components['schemas']['Profile'];
    if (!Number.isSafeInteger(profile.version) || response.headers.get('ETag') !== '"' + String(profile.version) + '"') throw new MobileIdentityError('contract', status);
  }
  return body as T;
}

/**
 * Create a fetch-injected API v2 transport with generated checks and a deadline covering connection and body reads.
 * Each request is single-attempt, omits cookies, blocks redirects and settles on abort even when fetch ignores its signal.
 * Throws only safe MobileIdentityError failures; listeners and timers are removed after every settled request.
 */
export function createMobileClient(options: MobileClientOptions): MobileClient {
  const { origin, timeoutMs } = configuration(options);
  return {
    /** Validate a known operation before sending it and race response consumption against cancellation/deadline. */
    async request<T>(checks: OperationChecks, request: MobileRequestOptions = {}): Promise<T> {
      if (request.signal?.aborted) throw new MobileIdentityError('cancelled');
      let init: RequestInit;
      // Schema acceptance does not guarantee custom getters/toJSON can be serialized safely.
      try { init = requestInit(checks, request); } catch { throw new MobileIdentityError('input'); }
      const controller = new AbortController();
      let rejectAbort: (error: MobileIdentityError) => void = () => {};
      const abort = new Promise<never>((_resolve, reject) => { rejectAbort = reject; });
      /** Reject using a fixed failure and abort native I/O without forwarding caller abort reasons. */
      const cancel = (): void => { rejectAbort(new MobileIdentityError('cancelled')); controller.abort(); };
      request.signal?.addEventListener('abort', cancel, { once: true });
      const timer = setTimeout(() => { rejectAbort(new MobileIdentityError('timeout')); controller.abort(); }, timeoutMs);
      try {
        if (request.signal?.aborted) cancel();
        const work = (async (): Promise<T> => {
          let response: Response;
          try { response = await options.fetch(origin + '/api/v2' + checks.path, { ...init, signal: controller.signal }); }
          catch { throw new MobileIdentityError('network'); }
          return consume<T>(response, checks, request);
        })();
        return await Promise.race([abort, work]);
      } finally {
        clearTimeout(timer); request.signal?.removeEventListener('abort', cancel);
      }
    },
  };
}
