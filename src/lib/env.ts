/**
 * Public frontend environment configuration.
 * Only VITE_* variables are exposed to the client bundle.
 * Never store secrets or service_role keys here.
 */
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Abdullah Sherif Portfolio',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || '',
  supabaseUrl,
  supabasePublishableKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
} as const;
