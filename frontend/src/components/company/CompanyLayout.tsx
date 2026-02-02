'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const companyNavigation = [
  { name: 'Dashboard', href: '/company', icon: '📊' },
  { name: 'Users', href: '/company/users', icon: '👥' },
  { name: 'Departments', href: '/company/departments', icon: '🏛️' },
  { name: 'Offices', href: '/company/offices', icon: '🏢' },
  { name: 'Roles & Permissions', href: '/company/roles', icon: '🔐' },
  { name: 'Settings', href: '/company/settings', icon: '⚙️' },
];

interface CompanyLayoutProps {
  children: ReactNode;
  companyName?: string;
}

export function CompanyLayout({ children, companyName = 'Company' }: CompanyLayoutProps) {
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
          <div className="flex items-center gap-4">
            <Link href="/company" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">K-shap</h1>
            </Link>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Company Settings</p>
              <p className="text-lg font-semibold text-foreground">{companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
            <LanguageSwitcher />
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
            {companyNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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

          {/* Quick Links */}
          <div className="border-t border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Quick Links</p>
            <div className="mt-3 space-y-2">
              <Link
                href="/dashboard"
                className="block text-xs text-primary hover:underline"
              >
                Back to Main Dashboard
              </Link>
              <Link
                href="/company/settings"
                className="block text-xs text-primary hover:underline"
              >
                Company Settings
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
