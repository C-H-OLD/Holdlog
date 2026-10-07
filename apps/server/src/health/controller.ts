import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import type pg from 'pg';

export const DATABASE = Symbol('foundation.database');

@Controller('internal/health')
export class HealthController {
  /** Inject the local DB pool; no product identity or permission bypass is installed. */
  constructor(@Inject(DATABASE) private readonly pool: pg.Pool) {}

  /** Return API process liveness only; worker/DB readiness is a separate observation. */
  @Get('live')
  live(): { status: 'ok' } { return { status: 'ok' }; }

  /** Query the real DB; return 503 with a fixed body and no SQL/connection error on failure. */
  @Get('ready')
  async ready(): Promise<{ status: 'ready' }> {
    try { await this.pool.query('SELECT 1'); return { status: 'ready' }; }
    catch { throw new ServiceUnavailableException({ status: 'unavailable' }); }
  }
}
