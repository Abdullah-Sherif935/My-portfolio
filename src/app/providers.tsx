import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { ThemeContext } from '@/hooks/useTheme';
import { PortfolioDataProvider } from '@/context/PortfolioDataContext';
import { AdminAuthProvider } from '@/features/admin/auth/AdminAuthContext';
import type { Theme } from '@/types/portfolio';

const THEME_STORAGE_KEY = 'abdullah-portfolio-theme';

function resolveInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }
  } catch {
    // Fallback to dark theme if storage or matchMedia is unavailable
  }
  return 'dark';
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const themeValue = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <MotionConfig reducedMotion="user">
      <ThemeContext.Provider value={themeValue}>
        <AdminAuthProvider>
          <PortfolioDataProvider>{children}</PortfolioDataProvider>
        </AdminAuthProvider>
      </ThemeContext.Provider>
    </MotionConfig>
  );
}
