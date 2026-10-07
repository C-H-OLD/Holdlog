import test from 'node:test';
import assert from 'node:assert/strict';
import { parseParameter } from '../../../scripts/contracts/http-input.mjs';
test('strict boolean and integer parsing', () => {
  assert.equal(parseParameter({ in: 'query', schema: { type: 'boolean' } }, 'false'), false);
  assert.equal(parseParameter({ in: 'header', schema: { type: 'integer' } }, '12'), 12);
  for (const value of ['1.2', '12x', '', ' 2', '1e2', '9007199254740992']) assert.throws(() => parseParameter({ in: 'query', schema: { type: 'integer' } }, value));
  assert.throws(() => parseParameter({ in: 'query', schema: { type: 'boolean' } }, 'yes'));
  assert.throws(() => parseParameter({ in: 'path', required: true, schema: { type: 'string' } }, undefined));
  assert.equal(parseParameter({ in: 'query', schema: { type: 'integer', default: 50 } }, undefined), undefined);
});
test('arrays respect declared serialization and unsupported inputs fail', () => {
  assert.deepEqual(parseParameter({ in: 'query', style: 'form', explode: false, schema: { type: 'array', items: { type: 'string' } } }, 'a,b'), ['a', 'b']);
  assert.deepEqual(parseParameter({ in: 'query', schema: { type: 'array', items: { type: 'integer' } } }, ['1', '2']), [1, 2]);
  assert.throws(() => parseParameter({ in: 'query', style: 'deepObject', schema: { type: 'object' } }, '{}'));
  assert.throws(() => parseParameter({ in: 'query', schema: { type: 'integer' } }, ['1', '2']));
});
