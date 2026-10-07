import { Platform } from 'react-native';
import { readDevelopmentOrigins } from '../../configuration/development-origin.cjs';
import { checkDevelopmentConnection, type HealthTarget } from './connection-check';
import { checkDevelopmentContracts } from './contract-check';

declare const process: { env: { EXPO_PUBLIC_DEV_API_ORIGIN_IOS?: string; EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID?: string } };

/** Register DevTools console checks only in a development native runtime; no requests occur until explicitly called. */
export function installDevelopmentChecks(): void {
  if (!__DEV__) return;
  const origins = readDevelopmentOrigins({ EXPO_PUBLIC_DEV_API_ORIGIN_IOS: process.env.EXPO_PUBLIC_DEV_API_ORIGIN_IOS, EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID: process.env.EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID });
  const origin = Platform.OS === 'ios' ? origins.ios : origins.android;
  Object.assign(globalThis, { holdlogDevelopment: {
    /** Check the current virtual device's host without sending authentication cookies. */
    checkConnection: (target: HealthTarget = 'ready') => checkDevelopmentConnection(origin, target),
    checkContracts: checkDevelopmentContracts,
  } });
}
