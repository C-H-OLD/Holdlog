import type { components } from '@holdlog/contracts/http';
import type { MediaJob, StorageStart, StorageRead } from '@holdlog/contracts/backend';
export type Request = components['schemas']['PersonalRecordInput'];
export type Job = MediaJob;
export type Start = StorageStart;
export type Read = StorageRead;
// @ts-expect-error media job kind is constrained by the source contract
export const invalidJobKind: MediaJob['kind'] = 'invented';
// @ts-expect-error storage expectedBytes is a number
export const invalidLength: StorageStart['expectedBytes'] = '1';
