import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createDatabase } from '../src/database/pool.js';
import { migrate } from '../src/database/migrate.js';
import { integrationConfiguration } from './helpers.js';

void test('real DB migration history is stable across reconnection and rejects modified applied SQL', async () => {
  const config = integrationConfiguration();
  const pool = createDatabase(config);
  const directory = await mkdtemp(join(tmpdir(), 'holdlog-migration-'));
  try {
    const sql = await readFile(new URL('../../db/migrations/001_foundation.sql', import.meta.url), 'utf8');
    await writeFile(join(directory, '001_foundation.sql'), sql);
    await migrate(pool, directory);
    await migrate(pool, directory);
    const id = randomUUID();
    await pool.query('INSERT INTO holdlog_foundation.job_effects(job_id) VALUES ($1)', [id]);
    await pool.end();
    const reopened = createDatabase(config);
    try {
      assert.equal((await reopened.query('SELECT job_id FROM holdlog_foundation.job_effects WHERE job_id=$1', [id])).rowCount, 1);
      const history = await reopened.query<{ checksum: string; applied_at: Date }>('SELECT checksum, applied_at FROM holdlog_foundation.migrations WHERE version=$1', ['001_foundation.sql']);
      assert.match(history.rows[0]!.checksum, /^[a-f0-9]{64}$/);
      assert.ok(history.rows[0]!.applied_at instanceof Date);
      await writeFile(join(directory, '001_foundation.sql'), sql + '\n-- changed');
      await assert.rejects(migrate(reopened, directory), /checksum/);
      await rm(join(directory, '001_foundation.sql'));
      await assert.rejects(migrate(reopened, directory), /missing/);
      await reopened.query('DELETE FROM holdlog_foundation.job_effects WHERE job_id=$1', [id]);
    } finally { await reopened.end(); }
  } finally { if (!pool.ended) await pool.end(); await rm(directory, { recursive: true }); }
});
