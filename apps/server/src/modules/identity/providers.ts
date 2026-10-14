import { timingSafeEqual } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, SignJWT, errors, type JWTVerifyGetKey, type JWTPayload } from 'jose';
import type { IdentityConfiguration } from '../../config/environment.js';
import type { IdentityVerifier, LoginInput, VerifiedIdentity } from './identity.service.js';
import { IdentityError, unauthenticated } from './errors.js';
import { hashSecret } from './identity.repository.js';
type ProviderConfiguration = Omit<IdentityConfiguration, 'admin'>;

/** Verify provider tokens with fixed trust configuration; injected resolvers/fetch support synthetic network tests. */
export class ProviderVerifier implements IdentityVerifier {
  private readonly keys: Record<'google' | 'apple', JWTVerifyGetKey>;
  /** Pin trusted JWKS URLs from validated server config and bound network fetch to five seconds. */
  constructor(private readonly config: ProviderConfiguration, keys?: Record<'google' | 'apple', JWTVerifyGetKey>, private readonly fetcher: typeof fetch = fetch) {
    this.keys = keys ?? { google: createRemoteJWKSet(new URL(config.google.jwksUrl), { timeoutDuration: 5000 }), apple: createRemoteJWKSet(new URL(config.apple.jwksUrl), { timeoutDuration: 5000 }) };
  }

  /** Verify signature/claims/nonce and optional Apple code exchange outside SQL locks; emit safe401/503 failures. */
  async verify(input: LoginInput, nonceHash: string): Promise<VerifiedIdentity> {
    try {
      const payload = await this.claims(input.provider, input.idToken, nonceHash);
      if (input.provider === 'apple' && input.authorizationCode !== null) {
        const exchanged = await this.exchange(input.authorizationCode, payload.aud as string);
        const checked = await this.claims('apple', exchanged, nonceHash);
        if (checked.sub !== payload.sub || checked.aud !== payload.aud) throw unauthenticated();
      }
      const verifiedEmail = payload.email_verified === true || payload.email_verified === 'true';
      const email = verifiedEmail && typeof payload.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ? payload.email : null;
      return { provider: input.provider, subject: payload.sub!, email };
    } catch (error) {
      if (error instanceof IdentityError) throw error;
      if (error instanceof errors.JWKSTimeout || (error instanceof DOMException && ['TimeoutError', 'AbortError'].includes(error.name)) || error instanceof TypeError || (error instanceof errors.JOSEError && error.code === 'ERR_JOSE_GENERIC')) throw new IdentityError(503, 'TEMPORARY_FAILURE');
      throw unauthenticated();
    }
  }

  /** Require expiry/subject and exact audience; Apple claim is already hashed while Google supplies the raw nonce. */
  private async claims(provider: 'google' | 'apple', token: string, nonceHash: string): Promise<JWTPayload> {
    const settings = this.config[provider];
    const { payload } = await jwtVerify(token, this.keys[provider], { issuer: provider === 'google' ? this.config.google.issuers : this.config.apple.issuer, audience: settings.audiences, algorithms: ['RS256'], requiredClaims: ['exp', 'sub', 'nonce'] });
    if (!payload.sub?.trim() || typeof payload.aud !== 'string' || typeof payload.nonce !== 'string') throw unauthenticated();
    if (provider === 'google' && payload.azp !== undefined && (typeof payload.azp !== 'string' || !settings.audiences.includes(payload.azp))) throw unauthenticated();
    const actual = provider === 'google' ? hashSecret(payload.nonce) : payload.nonce;
    if (!/^[a-f0-9]{64}$/.test(actual) || !timingSafeEqual(Buffer.from(actual), Buffer.from(nonceHash))) throw unauthenticated();
    return payload;
  }

  /** Exchange a supplied Apple code at its fixed endpoint with a short-lived signed server client secret. */
  private async exchange(code: string, audience: string): Promise<string> {
    if (!code) throw unauthenticated();
    const apple = this.config.apple;
    const clientSecret = await new SignJWT({}).setProtectedHeader({ alg: 'ES256', kid: apple.keyId }).setIssuer(apple.teamId).setSubject(audience).setAudience('https://appleid.apple.com').setIssuedAt().setExpirationTime('5m').sign(apple.privateKey);
    const response = await this.fetcher('https://appleid.apple.com/auth/token', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(5000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: audience, client_secret: clientSecret }) });
    if (response.status >= 500 || response.status === 429) throw new IdentityError(503, 'TEMPORARY_FAILURE');
    if (!response.ok) throw unauthenticated();
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('id_token' in result) || typeof result.id_token !== 'string') throw unauthenticated();
    return result.id_token;
  }
}
