import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language, LocalizedText } from '@/types/portfolio';

export const LANGUAGE_STORAGE_KEY = 'abdullah-portfolio-lang';

export function useLanguage() {
  const { i18n } = useTranslation();
  const language: Language = i18n.language === 'ar' ? 'ar' : 'en';
  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = useCallback(
    (next: Language) => {
      void i18n.changeLanguage(next);
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // Ignore storage write errors in restricted browsing modes
      }
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  const pick = useCallback(
    (text: LocalizedText): string => text[language],
    [language]
  );

  return { language, isRtl, setLanguage, toggleLanguage, pick };
}
