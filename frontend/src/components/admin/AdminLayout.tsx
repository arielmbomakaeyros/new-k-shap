'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
// import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
// import { ThemeSwitcher } from '../theme-switcher';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const adminNavigation = [
  { name: 'Overview', href: '/admin', icon: '📊' },
  { name: 'Companies', href: '/admin/companies', icon: '🏢' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: '💳' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Logs', href: '/admin/logs', icon: '📋' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <h1 className="text-2xl font-bold text-primary">K-shap</h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Platform Owner
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <nav className="space-y-1 p-4">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
