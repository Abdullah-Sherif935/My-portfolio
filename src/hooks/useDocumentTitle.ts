import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Dynamically updates document.title in the active language for every route.
 */
export function useDocumentTitle(pageTitle?: string) {
  const { t, i18n } = useTranslation('common');
  const siteTitle = t('meta.siteTitle');

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
  }, [pageTitle, siteTitle, i18n.language]);
}
