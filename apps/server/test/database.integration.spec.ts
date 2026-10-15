import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type Database from 'better-sqlite3';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { testDatabase } from './helpers.js';

const source = new URL('../../db/migrations/', import.meta.url);

/** Copy the repository migrations into a new folder so a test can add or change files without touching the originals. */
function migrationCopy(): string {
  const directory = mkdtempSync(join(tmpdir(), 'holdlog-migration-'));
  for (const name of readdirSync(source)) if (/^\d+_[a-z0-9_]+\.sql$/.test(name)) writeFileSync(join(directory, name), readFileSync(new URL(name, source), 'utf8'));
  return directory;
}

/** Read the applied migration history in version order. */
function history(db: Database.Database): { version: string; checksum: string; applied_at: string }[] {
  return db.prepare<[], { version: string; checksum: string; applied_at: string }>('SELECT version, checksum, applied_at FROM schema_migrations ORDER BY version').all();
}

void test('migration history is stable across reconnection and rejects modified or removed applied SQL', () => {
  const { config, db, close } = testDatabase(false);
  const directory = migrationCopy();
  try {
    const sql = readFileSync(new URL('001_foundation.sql', source), 'utf8');
    migrate(db, directory);
    migrate(db, directory);
    const id = randomUUID();
    db.prepare('INSERT INTO job_effects (job_id) VALUES (?)').run(id);
    db.close();
    const reopened = createDatabase(config);
    try {
      assert.equal(reopened.prepare('SELECT job_id FROM job_effects WHERE job_id=?').all(id).length, 1);
      const row = history(reopened).find(entry => entry.version === '001_foundation.sql')!;
      assert.match(row.checksum, /^[a-f0-9]{64}$/);
      assert.equal(new Date(row.applied_at).toISOString(), row.applied_at);
      writeFileSync(join(directory, '001_foundation.sql'), sql + '\n-- changed');
      assert.throws(() => migrate(reopened, directory), /checksum/);
      rmSync(join(directory, '001_foundation.sql'));
      assert.throws(() => migrate(reopened, directory), /missing/);
    } finally { reopened.close(); }
  } finally { close(); rmSync(directory, { recursive: true, force: true }); }
});

void test('an empty DB applies every file once and a second run changes nothing', () => {
  const { db, close } = testDatabase(false);
  try {
    migrate(db);
    const first = history(db);
    assert.deepEqual(first.map(row => row.version), readdirSync(source).filter(name => name.endsWith('.sql')).sort());
    migrate(db);
    assert.deepEqual(history(db), first);
  } finally { close(); }
});

void test('a foreign-key violation rolls back the migration and its history, and keys are on after both outcomes', () => {
  const { db, close } = testDatabase(false);
  const directory = migrationCopy();
  try {
    migrate(db, directory);
    assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
    writeFileSync(join(directory, '900_orphan.sql'), `CREATE TABLE orphan_parent (id TEXT NOT NULL PRIMARY KEY) STRICT;
      CREATE TABLE orphan_child (parent_id TEXT NOT NULL REFERENCES orphan_parent(id)) STRICT;
      INSERT INTO orphan_child VALUES ('missing');`);
    assert.throws(() => migrate(db, directory), /foreign key check/);
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name LIKE 'orphan_%'").all().length, 0);
    assert.equal(history(db).some(row => row.version === '900_orphan.sql'), false);
    assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
  } finally { close(); rmSync(directory, { recursive: true, force: true }); }
});

void test('rebuilding a parent table in a migration keeps its ON DELETE CASCADE children', () => {
  const { db, close } = testDatabase(false);
  const directory = migrationCopy();
  try {
    writeFileSync(join(directory, '900_rebuild_parent.sql'), `CREATE TABLE rebuild_parent (id TEXT NOT NULL PRIMARY KEY) STRICT;
      CREATE TABLE rebuild_child (id TEXT NOT NULL PRIMARY KEY, parent_id TEXT NOT NULL REFERENCES rebuild_parent(id) ON DELETE CASCADE) STRICT;
      INSERT INTO rebuild_parent VALUES ('parent'); INSERT INTO rebuild_child VALUES ('child', 'parent');`);
    migrate(db, directory);
    // SQLite's table rebuild: with keys on, DROP TABLE would cascade-delete the child row.
    writeFileSync(join(directory, '901_rebuild_parent.sql'), `CREATE TABLE rebuild_parent_new (id TEXT NOT NULL PRIMARY KEY, label TEXT) STRICT;
      INSERT INTO rebuild_parent_new (id) SELECT id FROM rebuild_parent;
      DROP TABLE rebuild_parent;
      ALTER TABLE rebuild_parent_new RENAME TO rebuild_parent;`);
    migrate(db, directory);
    assert.deepEqual(db.prepare('SELECT id, parent_id FROM rebuild_child').all(), [{ id: 'child', parent_id: 'parent' }]);
    assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
  } finally { close(); rmSync(directory, { recursive: true, force: true }); }
});

void test('a new DB file and its WAL files are readable only by the owner', { skip: process.platform === 'win32' }, () => {
  const { config, db, close } = testDatabase(false);
  try {
    db.exec('CREATE TABLE mode_fixture (id INTEGER PRIMARY KEY) STRICT');
    for (const suffix of ['', '-wal', '-shm']) assert.equal(statSync(config.databasePath + suffix).mode & 0o777, 0o600, suffix || 'database file');
  } finally { close(); }
});
