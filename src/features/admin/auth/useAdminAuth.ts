import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AdminAuthResult } from '@/services/authService';

export interface AdminAuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  signIn: (email: string, password: string) => Promise<AdminAuthResult>;
  signOut: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}
