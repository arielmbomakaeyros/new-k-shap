'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '@/components/theme-switcher';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <nav className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity">
              {t('common.appName', { defaultValue: 'K-shap' })}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Link href="/auth/login" className="cursor-pointer">
              <Button variant="outline">{t('auth.login')}</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-subtle border-t border-white/20">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p><span className="gradient-text font-medium">{t('common.appName', { defaultValue: 'K-shap' })}</span> © 2024. {t('common.welcome')}</p>
        </div>
      </footer>
    </div>
  );
}