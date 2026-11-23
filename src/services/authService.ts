import type { User } from '@supabase/supabase-js';
import { isSupabaseReady, requireSupabase, supabase } from '@/lib/supabase';

export type AdminAuthResult =
  | { ok: true; user: User }
  | { ok: false; code: 'not_configured' | 'invalid_credentials' | 'not_admin' | 'unknown'; message: string };

/**
 * Verifies the current authenticated user is listed in private.admin_users
 * via the server-side SQL RPC public.is_current_user_admin().
 */
export async function verifyCurrentUserIsAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_current_user_admin');
  if (error) return false;
  return data === true;
}

/**
 * Authenticates the single portfolio administrator with email + password,
 * then enforces allowlist membership before granting access.
 * Public sign-up is intentionally not implemented.
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<AdminAuthResult> {
  if (!isSupabaseReady || !supabase) {
    return {
      ok: false,
      code: 'not_configured',
      message: 'Supabase environment variables are not configured.',
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      code: 'invalid_credentials',
      message: error?.message || 'Invalid email or password.',
    };
  }

  const isAdmin = await verifyCurrentUserIsAdmin();
  if (!isAdmin) {
    await supabase.auth.signOut();
    return {
      ok: false,
      code: 'not_admin',
      message: 'This account is not authorized to access the admin dashboard.',
    };
  }

  return { ok: true, user: data.user };
}

/**
 * Retrieves the currently authenticated admin user using server-verified getUser()
 * combined with the admin allowlist RPC check.
 */
export async function getVerifiedAdminUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const isAdmin = await verifyCurrentUserIsAdmin();
  if (!isAdmin) {
    await supabase.auth.signOut();
    return null;
  }

  return data.user;
}

export async function signOutAdmin(): Promise<void> {
  const client = requireSupabase();
  await client.auth.signOut();
}
