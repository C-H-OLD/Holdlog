import * as validators from '@holdlog/contracts/validators';
import { index } from '@holdlog/contracts/operations';
import type { components } from '@holdlog/contracts/http';
import type { ClimbCount } from '@holdlog/contracts/runtime';

/** Consume generated HTTP/runtime types and the portable validator with synthetic input; returns a boolean. */
export function checkDevelopmentContracts(): boolean {
  const session: components['schemas']['AdminSession'] = { principalId: '00000000-0000-4000-8000-000000000001', expiresAt: '2026-10-07T00:00:00Z', csrfToken: 'synthetic' };
  const count: ClimbCount = { brandId: '00000000-0000-4000-8000-000000000002', gradeKey: 1, count: 1 };
  return validators[index.http.AdminSession as keyof typeof validators](session) && validators[index.runtime.ClimbCount as keyof typeof validators](count);
}
