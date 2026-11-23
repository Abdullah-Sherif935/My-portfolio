import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
      title={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-default bg-bg-secondary text-text-primary transition-colors duration-200 hover:border-accent hover:text-accent cursor-pointer',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
