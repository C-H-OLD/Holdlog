import * as SecureStore from 'expo-secure-store';
import { createSessionVault, type SessionVault } from './secureSession.ts';

const key = 'holdlog.mobile.identity.v1';
const options: SecureStore.SecureStoreOptions = {
  keychainService: 'holdlog.mobile.identity',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: false,
};

/**
 * Bind the pure vault to device-only keychain/Keystore storage. Call only after
 * T029 has verified the native build and supplied a fresh unbacked installation ID.
 * Reads, writes and deletion failures reject with a sanitized storage error.
 */
export function createNativeSessionVault(installationId: string): SessionVault {
  return createSessionVault({
    read: () => SecureStore.getItemAsync(key, options),
    write: (value) => SecureStore.setItemAsync(key, value, options),
    remove: () => SecureStore.deleteItemAsync(key, options),
  }, installationId);
}
