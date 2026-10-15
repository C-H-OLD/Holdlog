import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isUniqueViolation } from '../src/database/errors.js';
import { afterMilliseconds, at, now } from '../src/database/time.js';

void test('time SQL helpers emit fixed strftime expressions and refuse unexpected input', () => {
  assert.equal(now(), "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  assert.equal(now('+15 minutes'), "strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+15 minutes')");
  assert.equal(at('s.last_activity_at', '+30 minutes'), "strftime('%Y-%m-%dT%H:%M:%fZ', s.last_activity_at, '+30 minutes')");
  assert.equal(afterMilliseconds(1500), '+1.500 seconds');
  for (const modifier of ["+1 minutes'); DROP TABLE accounts; --", '15 minutes', '+1 weeks']) assert.throws(() => now(modifier), /modifier/);
  assert.throws(() => at('expires_at; DROP TABLE accounts', '+1 days'), /column/);
  for (const ms of [-1, Number.NaN, Number.POSITIVE_INFINITY]) assert.throws(() => afterMilliseconds(ms), /duration/);
});

void test('unique-collision detection accepts only SQLite primary-key and unique codes', () => {
  assert.equal(isUniqueViolation({ code: 'SQLITE_CONSTRAINT_UNIQUE' }), true);
  assert.equal(isUniqueViolation({ code: 'SQLITE_CONSTRAINT_PRIMARYKEY' }), true);
  for (const value of [{ code: 'SQLITE_CONSTRAINT_CHECK' }, { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' }, { code: '23505' }, new Error('SQLITE_CONSTRAINT_UNIQUE'), null, 'SQLITE_CONSTRAINT_UNIQUE']) {
    assert.equal(isUniqueViolation(value), false);
  }
});
