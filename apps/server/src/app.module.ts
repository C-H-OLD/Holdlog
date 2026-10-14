import 'reflect-metadata';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type pg from 'pg';
import type { Configuration } from './config/environment.js';
import { logEvent } from './config/logging.js';
import { createDatabase } from './database/pool.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { IdentityService, type IdentityVerifier } from './modules/identity/identity.service.js';
import { IdentityExceptionFilter } from './modules/identity/identity.controller.js';
import { DATABASE, HealthController } from './health/controller.js';

class DatabaseLifecycle implements OnApplicationShutdown {
  /** Own pool cleanup when Nest closes or receives a termination signal. */
  constructor(@Inject(DATABASE) private readonly pool: pg.Pool) {}
  /** Close pool connections after requests finish; propagation exposes shutdown failure. */
  async onApplicationShutdown(): Promise<void> { await this.pool.end(); }
}

@Module({})
export class AppModule {}

/**
 * Create a Nest API using validated local settings. The caller listens/closes the app.
 * Development health controllers are absent in production. Errors/logs never contain DB values.
 * Mobile identity endpoints are registered only with an explicitly configured verifier; no static private-file routes exist.
 */
export async function createApplication(config: Configuration, identity?: IdentityVerifier): Promise<NestExpressApplication> {
  const pool = createDatabase(config);
  try {
    const app = await NestFactory.create<NestExpressApplication>({ module: AppModule, imports: identity ? [IdentityModule.register(new IdentityService(pool, identity))] : [], controllers: config.environment === 'production' ? [] : [HealthController], providers: [{ provide: DATABASE, useValue: pool }, DatabaseLifecycle] }, { logger: false, abortOnError: false });
    if (identity) app.useGlobalFilters(new IdentityExceptionFilter(app.getHttpAdapter()));
    app.enableCors({ origin: config.allowedOrigins, credentials: true });
    app.use((_request: IncomingMessage, response: ServerResponse, next: () => void) => {
      response.once('finish', () => logEvent('request.finished', response.statusCode));
      next();
    });
    app.enableShutdownHooks();
    return app;
  } catch (error) { await pool.end(); throw error; }
}
