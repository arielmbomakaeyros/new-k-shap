'use client';

import { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import { QueryProvider } from './QueryProvider';
import { AuthInitializer } from './AuthInitializer';
import { ThemeProvider } from './ThemeProvider';
import { ErrorBoundary } from '../ErrorBoundary';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <QueryProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <AuthInitializer />
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </QueryProvider>
    </I18nProvider>
  );
}
