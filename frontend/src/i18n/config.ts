import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector/cjs';
import { initReactI18next } from '@/node_modules/react-i18next';

import enTranslation from './locales/en.json';
import frTranslation from './locales/fr.json';

const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default language is French
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
