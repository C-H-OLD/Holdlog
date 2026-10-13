import type { components } from '@holdlog/contracts/http';
type ErrorCode = components['schemas']['Error']['code'];

/** A safe business failure: no provider response, SQL detail or submitted secret is retained. */
export class IdentityError extends Error {
  /** Carry only contract status/code and public validation/version metadata to the HTTP adapter. */
  constructor(readonly status: number, readonly code: ErrorCode, readonly fieldErrors: components['schemas']['FieldError'][] = [], readonly currentVersion: number | null = null) { super(code); }
}

/** Reject unavailable credentials with the same public failure for all hidden authentication states. */
export function unauthenticated(): IdentityError { return new IdentityError(401, 'UNAUTHENTICATED'); }

/** Reject a field without reflecting the submitted value. */
export function invalid(path: string): IdentityError { return new IdentityError(400, 'INVALID_INPUT', [{ path: path.startsWith('/') ? path : '/' + path, code: 'INVALID_INPUT' }]); }
