import { loadConfiguration, loadMobileIdentityConfiguration } from './config/environment.js';
import { logEvent, reportStartupFailure } from './config/logging.js';
import { ProviderVerifier } from './modules/identity/providers.js';
import { createApplication } from './app.module.js';

/** Validate before opening sockets, start the API, and close resources on listen failure. */
async function main(): Promise<void> {
  const config = loadConfiguration();
  if (process.env.MOBILE_IDENTITY_ENABLED !== undefined && !['true', 'false'].includes(process.env.MOBILE_IDENTITY_ENABLED)) throw new Error('Invalid setting: MOBILE_IDENTITY_ENABLED');
  const verifier = process.env.MOBILE_IDENTITY_ENABLED === 'true' ? new ProviderVerifier(loadMobileIdentityConfiguration()) : undefined;
  const app = await createApplication(config, verifier);
  try { await app.listen(config.port, config.host); logEvent('api.started'); }
  catch (error) { await app.close(); throw error; }
}
await main().catch(error => reportStartupFailure(error, 'api'));
