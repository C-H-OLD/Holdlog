import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type { MobileAuthStore } from './mobileAuthStore.ts';

const Context = createContext<MobileAuthStore | null>(null);

/**
 * Supply the installation-scoped auth owner to approved routes. The application
 * composition root owns restore/dispose and native adapter activation; rendering
 * or React StrictMode remounts never create a provider login or delete keychain data.
 */
export function AuthProvider({ store, children }: { store: MobileAuthStore; children: ReactNode }) {
  return <Context.Provider value={store}>{children}</Context.Provider>;
}

/** Return auth commands; fail fast if a route was mounted outside its owner. */
export function useAuthStore(): MobileAuthStore {
  const store = useContext(Context);
  if (store === null) throw new Error('AuthProvider is required.');
  return store;
}

/** Subscribe to a stable nonsecret auth projection, including signup access gates. */
export function useAuth() {
  const store = useAuthStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
