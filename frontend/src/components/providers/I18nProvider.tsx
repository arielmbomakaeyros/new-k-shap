'use client';

import i18n from "@/src/i18n/config";
// import i18n from "@/i18n/config";
import { useAppStore } from "@/src/store/appStore";
import React from "react";

import { useEffect, useState } from 'react';
import { I18nextProvider } from '@/node_modules/react-i18next';
// import { useAppStore } from '@/store/appStore';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { locale, setLocale } = useAppStore();

  useEffect(() => {
    // Initialize locale from localStorage if not set
    if (!locale) {
      const storedLocale = localStorage.getItem('locale');
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'fr')) {
        setLocale(storedLocale as 'en' | 'fr');
      } else {
        // Default to browser language or English
        const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
        setLocale(browserLang as 'en' | 'fr');
      }
    } else {
      // Update i18n when locale changes
      i18n.changeLanguage(locale);
    }

    if (!i18n.isInitialized) {
      i18n.init({ lng: locale }).then(() => {
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, [locale, setLocale]);

  if (!isInitialized) {
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
