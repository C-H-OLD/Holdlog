import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkDevelopmentContracts } from '../src/development/contract-check.ts';

void test('portable generated HTTP/runtime validators accept the typed synthetic device inputs', () => {
  assert.equal(checkDevelopmentContracts(), true);
});
