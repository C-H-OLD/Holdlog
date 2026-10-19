import type { components } from '@holdlog/contracts/http';
import { createLoginChallengeChecks, loginChecks, completeSignupChecks, refreshSessionChecks, logoutChecks } from '@holdlog/contracts/mobile-identity-checks';
import { createMobileClient, type MobileClientOptions } from './client.ts';

export type LoginChallenge = components['schemas']['LoginChallenge'];
export type LoginInput = components['schemas']['LoginInput'];
export type SignupProof = components['schemas']['SignupProof'];
export type LoginResult = components['schemas']['LoginResult'];
export type CompleteSignupInput = components['schemas']['CompleteSignupInput'];
export type RefreshInput = components['schemas']['RefreshInput'];
export type MobileSession = components['schemas']['MobileSession'];
export interface MobileIdentityApi {
  challenge(key: string, signal?: AbortSignal): Promise<LoginChallenge>;
  login(input: LoginInput, key: string, signal?: AbortSignal): Promise<LoginResult>;
  signup(input: CompleteSignupInput, key: string, signal?: AbortSignal): Promise<MobileSession>;
  refresh(input: RefreshInput, key: string, signal?: AbortSignal): Promise<MobileSession>;
  logout(accessToken: string, key: string, signal?: AbortSignal): Promise<void>;
}

/** Check a stored or received mobile session with the generated refresh-success schema without coercing data. */
export function isMobileSession(value: unknown): value is MobileSession { return refreshSessionChecks.responses['200']!['application/json']!.validator(value); }

/**
 * Create anonymous challenge/login/signup/refresh and Bearer logout operations using shared HTTP DTO aliases.
 * Explicit UUID keys belong to the caller; failures are safe MobileIdentityError values and no retries occur here.
 */
export function createMobileIdentityApi(options: MobileClientOptions): MobileIdentityApi {
  const client = createMobileClient(options);
  return {
    /** Request a login nonce without sending session credentials. */
    challenge: (key, signal) => client.request(createLoginChallengeChecks, { key, ...(signal ? { signal } : {}) }),
    /** Authenticate an external provider result and preserve the generated existing/new-account branch. */
    login: (body, key, signal) => client.request(loginChecks, { body, key, ...(signal ? { signal } : {}) }),
    /** Complete a proof-bound signup; only HTTP201 is accepted. */
    signup: (body, key, signal) => client.request(completeSignupChecks, { body, key, ...(signal ? { signal } : {}) }),
    /** Exchange one refresh credential without attaching an access token or retrying rotation. */
    refresh: (body, key, signal) => client.request(refreshSessionChecks, { body, key, ...(signal ? { signal } : {}) }),
    /** Revoke the current session; validate its empty JSON result before returning void. */
    logout: async (accessToken, key, signal) => { await client.request(logoutChecks, { accessToken, key, ...(signal ? { signal } : {}) }); },
  };
}
