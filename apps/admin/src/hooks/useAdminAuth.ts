import { useContext, useSyncExternalStore } from 'react';
import { AdminAuthContext } from '../providers/authContext.ts';

/** Subscribe to public session metadata and generation-bound actions; requires an enclosing AuthProvider. */
export function useAdminAuth() {
  const store=useContext(AdminAuthContext);if(!store)throw new Error('Missing administrator AuthProvider');
  const snapshot=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot);
  return {store,snapshot};
}
