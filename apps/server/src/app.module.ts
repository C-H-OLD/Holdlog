import 'reflect-metadata';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type pg from 'pg';
import type { Configuration } from './config/environment.js';
import { logEvent } from './config/logging.js';
import { createDatabase } from './database/pool.js';
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
 * No product endpoints, authentication shortcuts or static private-file routes are registered.
 */
export async function createApplication(config: Configuration): Promise<NestExpressApplication> {
  const pool = createDatabase(config);
  try {
    const app = await NestFactory.create<NestExpressApplication>({ module: AppModule, controllers: config.environment === 'production' ? [] : [HealthController], providers: [{ provide: DATABASE, useValue: pool }, DatabaseLifecycle] }, { logger: false, abortOnError: false });
    app.enableCors({ origin: config.allowedOrigins, credentials: true });
    app.use((_request: IncomingMessage, response: ServerResponse, next: () => void) => {
      response.once('finish', () => logEvent('request.finished', response.statusCode));
      next();
    });
    app.enableShutdownHooks();
    return app;
  } catch (error) { await pool.end(); throw error; }
}
