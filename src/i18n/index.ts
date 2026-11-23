import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY } from '@/hooks/useLanguage';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enPages from './locales/en/pages.json';
import enAdmin from './locales/en/admin.json';
import arCommon from './locales/ar/common.json';
import arHome from './locales/ar/home.json';
import arPages from './locales/ar/pages.json';
import arAdmin from './locales/ar/admin.json';

function getInitialLanguage(): 'en' | 'ar' {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      home: enHome,
      pages: enPages,
      admin: enAdmin,
    },
    ar: {
      common: arCommon,
      home: arHome,
      pages: arPages,
      admin: arAdmin,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home', 'pages', 'admin'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
