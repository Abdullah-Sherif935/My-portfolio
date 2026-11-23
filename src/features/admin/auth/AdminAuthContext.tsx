import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  getVerifiedAdminUser,
  signInAdmin,
  signOutAdmin,
} from '@/services/authService';
import { AdminAuthContext, type AdminAuthContextValue } from './useAdminAuth';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      try {
        const verified = await getVerifiedAdminUser();
        if (active) setUser(verified);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsChecking(false);
      }
    };

    void verify();

    if (!supabase) {
      setIsChecking(false);
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (active) {
          setUser(null);
          setIsChecking(false);
        }
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void verify();
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInAdmin(email, password);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin();
    setUser(null);
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isChecking,
      signIn,
      signOut,
    }),
    [user, isChecking, signIn, signOut]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
