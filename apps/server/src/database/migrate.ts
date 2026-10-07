import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type pg from 'pg';

/**
 * Apply ordered SQL files and version/checksum/time history in one locked transaction.
 * Reject modified or removed applied files. Throws on read/SQL/checksum failure; rolls back.
 * The optional directory is for isolated migration tests, never product data fixtures.
 */
export async function migrate(pool: pg.Pool, directory = fileURLToPath(new URL('../../../db/migrations/', import.meta.url))): Promise<void> {
  const names = (await readdir(directory)).filter(name => /^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
  if (!names.length) throw new Error('Applied migration missing');
  const files = await Promise.all(names.map(async name => { const sql = await readFile(join(directory, name), 'utf8'); return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') }; }));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(73001001)');
    await client.query('CREATE SCHEMA IF NOT EXISTS holdlog_foundation');
    await client.query('CREATE TABLE IF NOT EXISTS holdlog_foundation.migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const history = await client.query<{ version: string; checksum: string }>('SELECT version, checksum FROM holdlog_foundation.migrations');
    for (const applied of history.rows) {
      const file = files.find(file => file.name === applied.version);
      if (!file) throw new Error('Applied migration missing');
      if (file.checksum !== applied.checksum) throw new Error('Applied migration checksum changed');
    }
    for (const file of files) {
      if (history.rows.some(row => row.version === file.name)) continue;
      await client.query(file.sql);
      await client.query('INSERT INTO holdlog_foundation.migrations(version, checksum) VALUES ($1, $2)', [file.name, file.checksum]);
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
