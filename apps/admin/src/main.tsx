import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAdminAuthApi } from './api/auth.ts';
import { AdminAuthStore } from './providers/adminAuthStore.ts';
import { AuthProvider } from './providers/AuthProvider.tsx';

// Only mount React. Product screens belong to their feature issues and Figma references.
const container = document.getElementById('root');
if (!container) throw new Error('Missing React root');
const auth=new AdminAuthStore(createAdminAuthApi());
createRoot(container).render(<StrictMode><AuthProvider store={auth}>{null}</AuthProvider></StrictMode>);
