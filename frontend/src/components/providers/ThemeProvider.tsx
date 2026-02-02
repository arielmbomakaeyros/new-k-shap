'use client';

import { useAppStore } from '@/src/store/appStore';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme } = useAppStore();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}