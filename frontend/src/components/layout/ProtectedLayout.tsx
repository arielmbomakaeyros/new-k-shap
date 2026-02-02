'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '@/components/theme-switcher';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function ProtectedLayout({ children, title }: ProtectedLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity">
              {t('common.appName', { defaultValue: 'K-shap' })}
            </Link>
            {title && (
              <span className="ml-4 text-lg font-semibold text-foreground">{title}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-subtle border-t border-white/20">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p><span className="gradient-text font-medium">{t('common.appName', { defaultValue: 'K-shap' })}</span> © 2024</p>
        </div>
      </footer>
    </div>
  );
}