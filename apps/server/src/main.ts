import { loadConfiguration } from './config/environment.js';
import { logEvent, reportStartupFailure } from './config/logging.js';
import { createApplication } from './app.module.js';

/** Validate before opening sockets, start the API, and close resources on listen failure. */
async function main(): Promise<void> {
  const config = loadConfiguration();
  const app = await createApplication(config);
  try { await app.listen(config.port, config.host); logEvent('api.started'); }
  catch (error) { await app.close(); throw error; }
}
await main().catch(error => reportStartupFailure(error, 'api'));
