import type { LoginChallenge } from '../api/holdlog/auth.ts';

export type IdentityProvider = 'google' | 'apple';
export interface ProviderCredential { idToken: string; authorizationCode: string | null }
export interface IdentityProviderAdapter {
  /**
   * Obtain credentials using this fresh challenge nonce. Implementations must
   * verify cancellation and return a sanitized cancelled/unavailable error.
   * A real adapter is enabled only after T029's OS/provider/device evidence.
   */
  authorize(provider: IdentityProvider, challenge: Readonly<LoginChallenge>, signal: AbortSignal): Promise<ProviderCredential>;
}
