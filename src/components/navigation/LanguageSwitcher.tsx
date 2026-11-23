import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils/cn';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation('common');
  const isArabic = language === 'ar';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={isArabic ? t('nav.switchToEnglish') : t('nav.switchToArabic')}
      title={isArabic ? t('nav.switchToEnglish') : t('nav.switchToArabic')}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs font-semibold text-text-primary transition-colors duration-200 hover:border-accent hover:text-accent cursor-pointer',
        className
      )}
    >
      <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="font-mono tracking-wide">{isArabic ? 'EN' : 'AR'}</span>
    </button>
  );
}
