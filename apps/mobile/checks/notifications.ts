import type { operations } from '@holdlog/contracts/http';
import * as validators from '@holdlog/contracts/validators';
import { index } from '@holdlog/contracts/operations';

export type NotificationPage = operations['myNotifications']['responses'][200]['content']['application/json'];
export type NotificationReadResult = operations['markNotificationRead']['responses'][200]['content']['application/json'];
export type NotificationReadAllResult = operations['readAllNotifications']['responses'][200]['content']['application/json'];
export type NotificationReadInput = operations['markNotificationRead']['requestBody']['content']['application/json'];

/**
 * Consume the same generated notification results with synthetic contract input.
 * @returns True only when all three values match the generated schemas. Updates
 * validator error properties; does not request an API, persist reads or check authorization.
 */
export function checkNotificationContracts(page: NotificationPage, single: NotificationReadResult, all: NotificationReadAllResult): boolean {
  return validators[index.http.NotificationPage as keyof typeof validators](page)
    && validators[index.http.NotificationReadResult as keyof typeof validators](single)
    && validators[index.http.NotificationReadAllResult as keyof typeof validators](all);
}

export const emptyReadInput: NotificationReadInput = {};
// @ts-expect-error the authenticated recipient cannot be supplied in the body
export const spoofedReadInput: NotificationReadInput = { accountId: 'synthetic' };
