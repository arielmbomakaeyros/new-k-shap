'use client';

import { useTranslation } from '@/node_modules/react-i18next';

export function useI18n() {
  const { t, i18n } = useTranslation();

  return {
    t,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    languages: ['en', 'fr'],
  };
}
