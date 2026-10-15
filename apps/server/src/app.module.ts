import 'reflect-metadata';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type Database from 'better-sqlite3';
import type { Configuration, IdentityConfiguration } from './config/environment.js';
import { logEvent } from './config/logging.js';
import { createDatabase } from './database/pool.js';
import { AdminSessionService } from './modules/identity/admin-session.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { IdentityService, type IdentityVerifier } from './modules/identity/identity.service.js';
import { IdentityExceptionFilter } from './modules/identity/identity.controller.js';
import { DATABASE, HealthController } from './health/controller.js';

class DatabaseLifecycle implements OnApplicationShutdown {
  /** Own connection cleanup when Nest closes or receives a termination signal. */
  constructor(@Inject(DATABASE) private readonly db: Database.Database) {}
  /** Close the SQLite connection after requests finish; a thrown error exposes shutdown failure. */
  onApplicationShutdown(): void { this.db.close(); }
}

@Module({})
export class AppModule {}

/**
 * Create a Nest API using validated local settings. The caller listens/closes the app.
 * Development health controllers are absent in production. Errors/logs never contain DB values.
 * Mobile and administrator endpoints are independently opt-in; no static private-file routes exist.
 */
export async function createApplication(config: Configuration, identity?: IdentityVerifier, admin?: IdentityConfiguration['admin']): Promise<NestExpressApplication> {
  const db = createDatabase(config);
  try {
    const app = await NestFactory.create<NestExpressApplication>({ module: AppModule, imports: [...(identity ? [IdentityModule.register(new IdentityService(db, identity))] : []), ...(admin ? [IdentityModule.registerAdministrator(new AdminSessionService(db, admin))] : [])], controllers: config.environment === 'production' ? [] : [HealthController], providers: [{ provide: DATABASE, useValue: db }, DatabaseLifecycle] }, { logger: false, abortOnError: false });
    if (identity || admin) app.useGlobalFilters(new IdentityExceptionFilter(app.getHttpAdapter()));
    // Keep credentialed admin CORS on its own HTTPS allowlist; foundation/mobile origins cannot read its CSRF response.
    app.enableCors((request:IncomingMessage,callback:(error:Error|null,options:{origin:string[];credentials:boolean})=>void)=>{
      const path=(request.url??'').split('?')[0]!;
      callback(null,{origin:(path==='/api/v2/admin'||path.startsWith('/api/v2/admin/'))?admin?.allowedOrigins??[]:config.allowedOrigins,credentials:true});
    });
    app.use((_request: IncomingMessage, response: ServerResponse, next: () => void) => {
      response.once('finish', () => logEvent('request.finished', response.statusCode));
      next();
    });
    app.enableShutdownHooks();
    return app;
  } catch (error) { db.close(); throw error; }
}
