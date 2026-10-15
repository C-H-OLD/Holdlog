import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import type Database from 'better-sqlite3';

export const DATABASE = Symbol('foundation.database');

@Controller('internal/health')
export class HealthController {
  /** Inject the API's SQLite connection; no product identity or permission bypass is installed. */
  constructor(@Inject(DATABASE) private readonly db: Database.Database) {}

  /** Return API process liveness only; worker/DB readiness is a separate observation. */
  @Get('live')
  live(): { status: 'ok' } { return { status: 'ok' }; }

  /**
   * Return ready only after migrations were applied to this DB file; otherwise 503 with a fixed body.
   * Opening a SQLite file rarely fails, so SELECT 1 alone would always pass. No SQL/file error is exposed.
   */
  @Get('ready')
  ready(): { status: 'ready' } {
    try { if (this.db.prepare('SELECT 1 FROM schema_migrations LIMIT 1').get()) return { status: 'ready' }; }
    catch { /* A missing history table or unreadable file is reported as unavailable below. */ }
    throw new ServiceUnavailableException({ status: 'unavailable' });
  }
}
