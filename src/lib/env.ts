/**
 * Public frontend environment configuration.
 * Only VITE_* variables are exposed to the client bundle.
 * Never store secrets or service_role keys here.
 */
export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Abdullah Sherif Portfolio',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || '',
} as const;
