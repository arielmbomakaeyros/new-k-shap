'use client';

import { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import { QueryProvider } from './QueryProvider';
import { AuthInitializer } from './AuthInitializer';
import { ThemeProvider } from './ThemeProvider';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <QueryProvider>
        <ThemeProvider>
          <AuthInitializer />
          {children}
        </ThemeProvider>
      </QueryProvider>
    </I18nProvider>
  );
}
