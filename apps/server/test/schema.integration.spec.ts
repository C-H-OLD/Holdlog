import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { isoFromNow, testDatabase } from './helpers.js';

const digest = createHash('sha256').update('fixture').digest('hex');
// U+0009–000D, U+0020, U+00A0, U+1680, U+2000–200A, U+2028, U+2029, U+202F, U+205F, U+3000, U+FEFF: JavaScript trim() whitespace.
const trimmed = [9, 10, 11, 12, 13, 32, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288, 65279];

void test('STRICT tables reject values of another type', () => {
  const { db, close } = testDatabase();
  try {
    assert.throws(() => db.prepare("INSERT INTO accounts (id, display_name, version) VALUES (?, 'fixture', 'one')").run(randomUUID()), { code: 'SQLITE_CONSTRAINT_DATATYPE' });
  } finally { close(); }
});

void test('CHECK constraints keep UUIDs, times, hex digests, Argon2 hashes and booleans canonical', () => {
  const { db, close } = testDatabase();
  /** Expect one statement to fail its CHECK constraint. */
  const rejects = (sql: string, ...values: unknown[]) => assert.throws(() => db.prepare(sql).run(...values), { code: 'SQLITE_CONSTRAINT_CHECK' });
  try {
    rejects("INSERT INTO accounts (id, display_name) VALUES (?, 'fixture')", randomUUID().toUpperCase());
    const expires = isoFromNow(300_000);
    rejects('INSERT INTO login_challenges (id, nonce_hash, created_at, expires_at) VALUES (?, ?, ?, ?)', randomUUID(), digest, '2026-10-14 06:00:00', expires);
    // strftime() returns NULL for text it cannot parse; the IS comparison still rejects it.
    for (const value of ['garbage', '2026-13-01T00:00:00.000Z', new Date(Date.now() - 86_400_000).toUTCString()]) rejects('INSERT INTO login_challenges (id, nonce_hash, expires_at) VALUES (?, ?, ?)', randomUUID(), digest, value);
    rejects('INSERT INTO login_challenges (id, nonce_hash, expires_at) VALUES (?, ?, ?)', randomUUID(), digest.toUpperCase(), expires);
    rejects('INSERT INTO login_challenges (id, nonce_hash, expires_at) VALUES (?, ?, ?)', randomUUID(), digest.slice(1), expires);
    rejects("INSERT INTO service_administrators (id, login_id, credential_hash) VALUES (?, 'fixture', '$ARGON2ID$v=19$fixture')", randomUUID());
    rejects("INSERT INTO service_administrators (id, login_id, credential_hash, active) VALUES (?, 'fixture', '$argon2id$v=19$fixture', 2)", randomUUID());
    db.prepare("INSERT INTO service_administrators (id, login_id, credential_hash) VALUES (?, 'fixture', '$argon2id$v=19$fixture')").run(randomUUID());
  } finally { close(); }
});

void test('a display name made only of any JavaScript trim() whitespace is rejected; inner whitespace is kept', () => {
  const { db, close } = testDatabase();
  try {
    for (const code of trimmed) {
      assert.throws(() => db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(randomUUID(), String.fromCharCode(code).repeat(2)), { code: 'SQLITE_CONSTRAINT_CHECK' }, `U+${code.toString(16)}`);
    }
    db.prepare('INSERT INTO accounts (id, display_name) VALUES (?, ?)').run(randomUUID(), '　가 나　');
  } finally { close(); }
});
