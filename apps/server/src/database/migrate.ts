import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import { withTransaction } from './transaction.js';

/**
 * Apply ordered SQL files and version/checksum/time history in one BEGIN IMMEDIATE transaction.
 * The write lock replaces PostgreSQL's advisory lock between concurrent migrators.
 * Foreign keys are turned off before BEGIN (SQLite ignores the pragma inside a transaction) so a table rebuild
 * cannot cascade-delete child rows; foreign_key_check must be clean before COMMIT and keys are re-enabled on
 * every outcome. Rejects modified or removed applied files. Throws on read/SQL/checksum/key failure after rollback.
 * The optional directory is for isolated migration tests, never product data fixtures.
 */
export function migrate(db: Database.Database, directory = fileURLToPath(new URL('../../../db/migrations/', import.meta.url))): void {
  const names = readdirSync(directory).filter(name => /^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
  if (!names.length) throw new Error('Applied migration missing');
  const files = names.map(name => { const sql = readFileSync(join(directory, name), 'utf8'); return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') }; });
  db.pragma('foreign_keys = OFF');
  try {
    withTransaction(db, () => {
      db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT NOT NULL PRIMARY KEY,
        checksum TEXT NOT NULL CHECK (length(checksum) = 64 AND checksum NOT GLOB '*[^0-9a-f]*'),
        applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (applied_at IS strftime('%Y-%m-%dT%H:%M:%fZ', applied_at))
      ) STRICT`);
      const history = db.prepare<[], { version: string; checksum: string }>('SELECT version, checksum FROM schema_migrations').all();
      for (const applied of history) {
        const file = files.find(file => file.name === applied.version);
        if (!file) throw new Error('Applied migration missing');
        if (file.checksum !== applied.checksum) throw new Error('Applied migration checksum changed');
      }
      for (const file of files) {
        if (history.some(row => row.version === file.name)) continue;
        db.exec(file.sql);
        db.prepare('INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)').run(file.name, file.checksum);
      }
      if ((db.pragma('foreign_key_check') as unknown[]).length) throw new Error('Migration foreign key check failed');
    });
  } finally { db.pragma('foreign_keys = ON'); }
}
