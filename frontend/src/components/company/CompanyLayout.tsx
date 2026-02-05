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

const companyNavigation = [
  { name: 'Dashboard', href: '/company', icon: '📊' },
  { name: 'Users', href: '/company/users', icon: '👥' },
  { name: 'Beneficiaries', href: '/company/beneficiaries', icon: '🧾' },
  { name: 'Disbursement Types', href: '/company/disbursement-types', icon: '💳' },
  { name: 'Payment Methods', href: '/company/payment-methods', icon: '💰' },
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
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <h1 className="text-2xl font-bold gradient-text">K-shap</h1>
            </Link>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Company Settings</p>
              <p className="text-lg font-semibold text-foreground">{companyName}</p>
            </div>
          </div>
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

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 glass-subtle border-r border-white/20">
          <nav className="space-y-1 p-4">
            {companyNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  pathname === item.href
                    ? 'gradient-bg-primary text-white shadow-md glow-primary'
                    : 'text-foreground hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="border-t border-white/20 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Quick Links</p>
            <div className="mt-3 space-y-2">
              <Link
                href="/dashboard"
                className="block text-xs gradient-text hover:opacity-80 transition-opacity cursor-pointer"
              >
                Back to Main Dashboard
              </Link>
              <Link
                href="/company/settings"
                className="block text-xs gradient-text hover:opacity-80 transition-opacity cursor-pointer"
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
