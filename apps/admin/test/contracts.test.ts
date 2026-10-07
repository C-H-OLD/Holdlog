import assert from 'node:assert/strict';
import { test } from 'node:test';
import { index } from '@holdlog/contracts/operations';
import * as validators from '@holdlog/contracts/validators';
import { API_BASE_PATH, type AdminSession } from '../src/api/contracts.ts';

void test('administrator consumes the existing generated HTTP type and standalone validator', () => {
  const session: AdminSession = { principalId: '00000000-0000-4000-8000-000000000001', expiresAt: '2026-10-07T04:00:00Z', csrfToken: 'synthetic-token' };
  const key = index.http.AdminSession as keyof typeof validators;
  assert.ok(validators[key](session));
  assert.equal(validators[key]({ ...session, principalId: 1 }), false);
  assert.equal(API_BASE_PATH, '/api/v1');
});
