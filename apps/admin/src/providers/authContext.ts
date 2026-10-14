import { createContext } from 'react';
import type { AdminAuthStore } from './adminAuthStore.ts';
export const AdminAuthContext=createContext<AdminAuthStore|null>(null);
