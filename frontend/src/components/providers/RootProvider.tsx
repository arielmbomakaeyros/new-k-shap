'use client';

import { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import { QueryProvider } from './QueryProvider';
import { AuthInitializer } from './AuthInitializer';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <QueryProvider>
        <AuthInitializer />
        {children}
      </QueryProvider>
    </I18nProvider>
  );
}
