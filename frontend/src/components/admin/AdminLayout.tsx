'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
// import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { useLogout } from '@/src/hooks/queries';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { NotificationsDropdown } from '@/src/components/notifications/NotificationsDropdown';
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
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <h1 className="text-2xl font-bold text-primary">K-shap</h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Platform Owner
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
            <NotificationsDropdown />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-[72px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-64 border-r border-border bg-card/95 backdrop-blur">
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
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
