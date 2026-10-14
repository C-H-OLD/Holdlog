import { useEffect, type ReactNode } from 'react';
import { AdminAuthContext } from './authContext.ts';
import type { AdminAuthStore } from './adminAuthStore.ts';

/**
 * Mount an injected memory-only session owner and reconstruct cookie authority once for this lifetime.
 * StrictMode/unmount cancels reads and clears protected state; it never assumes the server cookie is revoked.
 */
export function AuthProvider({store,children}:{store:AdminAuthStore;children:ReactNode}) {
  useEffect(()=>{void store.check().catch(()=>undefined);return ()=>{store.suspend();};},[store]);
  return <AdminAuthContext value={store}>{children}</AdminAuthContext>;
}
