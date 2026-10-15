import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { asPromise, withTransaction } from '../src/database/transaction.js';
import { testDatabase } from './helpers.js';

void test('withTransaction commits work, and rolls back and rethrows the original error when work throws', () => {
  const { db, close } = testDatabase();
  const committed = randomUUID(), rolledBack = randomUUID(), failure = new Error('synthetic transaction failure');
  /** Count synthetic effects stored for one id. */
  const effects = (id: string) => db.prepare('SELECT job_id FROM job_effects WHERE job_id=?').all(id).length;
  try {
    withTransaction(db, () => { db.prepare('INSERT INTO job_effects (job_id) VALUES (?)').run(committed); });
    assert.equal(effects(committed), 1);
    assert.throws(() => withTransaction(db, () => { db.prepare('INSERT INTO job_effects (job_id) VALUES (?)').run(rolledBack); throw failure; }), error => error === failure);
    assert.equal(effects(rolledBack), 0);
    assert.equal(db.inTransaction, false);
  } finally { close(); }
});

void test('a Promise-returning callback is a type error and a runtime TypeError that rolls back', () => {
  const { db, close } = testDatabase();
  const id = randomUUID();
  try {
    // @ts-expect-error -- transaction work must be synchronous; awaiting inside would escape the transaction.
    assert.throws(() => withTransaction(db, () => { db.prepare('INSERT INTO job_effects (job_id) VALUES (?)').run(id); return Promise.resolve(); }), TypeError);
    assert.equal(db.prepare('SELECT job_id FROM job_effects WHERE job_id=?').all(id).length, 0);
    assert.equal(db.inTransaction, false);
  } finally { close(); }
});

void test('a deferred foreign-key failure at COMMIT rolls back and leaves the connection usable', () => {
  const { db, close } = testDatabase();
  try {
    db.exec(`CREATE TEMP TABLE parent_fixture (id TEXT NOT NULL PRIMARY KEY) STRICT;
      CREATE TEMP TABLE child_fixture (id TEXT NOT NULL PRIMARY KEY, parent_id TEXT REFERENCES parent_fixture(id) DEFERRABLE INITIALLY DEFERRED) STRICT;`);
    assert.throws(() => withTransaction(db, () => { db.prepare("INSERT INTO child_fixture VALUES ('child', 'missing')").run(); }), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
    assert.equal(db.inTransaction, false);
    assert.equal(db.prepare('SELECT id FROM child_fixture').all().length, 0);
    withTransaction(db, () => { db.prepare("INSERT INTO parent_fixture VALUES ('parent')").run(); db.prepare("INSERT INTO child_fixture VALUES ('child', 'parent')").run(); });
    assert.equal(db.prepare('SELECT id FROM child_fixture').all().length, 1);
  } finally { close(); }
});

void test('asPromise runs work immediately and turns a thrown error into a rejection', async () => {
  const failure = new Error('synthetic failure');
  let ran = false;
  const pending = asPromise(() => { ran = true; return 7; });
  assert.equal(ran, true);
  assert.equal(await pending, 7);
  await assert.rejects(asPromise(() => { throw failure; }), error => error === failure);
});
