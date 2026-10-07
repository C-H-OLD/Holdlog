import type { operations, components } from '@holdlog/contracts/http';
import type { Route, WorkoutDisplay } from '@holdlog/contracts/runtime';
import { getFixtures } from '@holdlog/contracts/fixtures';
import { parseParameter } from '@holdlog/contracts/http-input';
import * as validators from '@holdlog/contracts/validators';
export const count: components['schemas']['ClimbCount'] = { brandId: 'id', gradeKey: 0, count: 0 };
export type ProfileResponse = operations['getMyProfile']['responses'][200];
export type Navigation = Route;
export type Display = WorkoutDisplay;
export const fixtures: unknown = getFixtures();
export const parsed: unknown = parseParameter({ in: 'query', schema: { type: 'boolean' } }, 'false');
export const validation: unknown = validators;
// @ts-expect-error count is an integer value, not a string
export const badCount: components['schemas']['ClimbCount'] = { brandId: 'id', gradeKey: 0, count: '0' };
// @ts-expect-error Route tabContext is a defined enum
export const badTab: Route['tabContext'] = 'invented';
// @ts-expect-error required count field is absent
export const missingCount: components['schemas']['ClimbCount'] = { brandId: 'id', gradeKey: 0 };
