import { chmodSync, existsSync } from 'node:fs';
import Database from 'better-sqlite3';
import type { Configuration } from '../config/environment.js';

/**
 * Open the configured SQLite file as this process's single connection; the caller must close it.
 * WAL lets readers and the writer proceed across processes on one host. foreign_keys, a 5-second
 * busy wait for another process's write lock and FULL commit durability are per-connection settings,
 * so every opener applies them here. A newly created file is made owner-only (0600); SQLite gives its -wal/-shm
 * files the same permissions. Throws when the file cannot be opened or configured; no path is logged.
 */
export function createDatabase(config: Pick<Configuration, 'databasePath'>): Database.Database {
  const created = !existsSync(config.databasePath);
  const db = new Database(config.databasePath);
  try {
    if (created) chmodSync(config.databasePath, 0o600);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    db.pragma('synchronous = FULL');
    return db;
  } catch (error) { db.close(); throw error; }
}
