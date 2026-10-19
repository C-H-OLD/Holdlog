import type { components } from '@holdlog/contracts/http';
import { getMyProfileChecks, editMyProfileChecks } from '@holdlog/contracts/mobile-identity-checks';
import { createMobileClient, type MobileClientOptions } from './client.ts';

export type Profile = components['schemas']['Profile'];
export type ProfileInput = components['schemas']['ProfileInput'];
export interface ProfileEditOptions { accessToken: string; key: string; version: number }
export interface MobileProfileApi {
  get(accessToken: string, signal?: AbortSignal): Promise<Profile>;
  edit(input: ProfileInput, options: ProfileEditOptions, signal?: AbortSignal): Promise<Profile>;
}

/**
 * Create Bearer-only profile reads/edits; results require an ETag matching their generated Profile.version.
 * Edits take an explicit UUID key and positive version serialized as a quoted If-Match; no retries occur here.
 */
export function createMobileProfileApi(options: MobileClientOptions): MobileProfileApi {
  const client = createMobileClient(options);
  return {
    /** Read the signed-in profile and validate its version header before exposing it. */
    get: (accessToken, signal) => client.request(getMyProfileChecks, { accessToken, profile: true, ...(signal ? { signal } : {}) }),
    /** Submit a profile change with caller-owned concurrency and idempotency tokens. */
    edit: (body, edit, signal) => client.request(editMyProfileChecks, { body, ...edit, profile: true, ...(signal ? { signal } : {}) }),
  };
}
