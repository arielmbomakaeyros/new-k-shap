'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { useLogout } from '@/src/hooks/queries';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { BackButton } from '@/src/components/ui/BackButton';
import { Home, FileText, Wallet, Users, Building2, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { NotificationsDropdown } from '@/src/components/notifications/NotificationsDropdown';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export function ProtectedLayout({ children, title, showBackButton = true }: ProtectedLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Check user roles
  const isKaeyrosAdmin = user?.systemRoles?.some(role =>
    ['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support'].includes(role)
  );
  const isCompanyAdmin = user?.systemRoles?.some(role =>
    ['company_super_admin', 'company_admin'].includes(role)
  );

  // Navigation items for company users
  const companyNavItems = [
    { href: '/dashboard', label: t('navigation.dashboard'), icon: Home },
    { href: '/disbursements', label: t('navigation.disbursements'), icon: FileText },
    { href: '/collections', label: t('navigation.collections'), icon: Wallet },
  ];

  const companyManagementItems = [
    { href: '/company/users', label: t('navigation.users', { defaultValue: 'Users' }) },
    { href: '/company/departments', label: t('navigation.departments', { defaultValue: 'Departments' }) },
    { href: '/company/offices', label: t('navigation.offices', { defaultValue: 'Offices' }) },
    { href: '/company/roles', label: t('navigation.roles', { defaultValue: 'Roles' }) },
    { href: '/company/settings', label: t('navigation.settings') },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isDashboard = pathname === '/dashboard';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity">
                {t('common.appName', { defaultValue: 'K-shap' })}
              </Link>

              {/* Main Navigation for company users */}
              {!isKaeyrosAdmin && (
                <div className="hidden md:flex items-center gap-1">
                  {companyNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {/* Company Management Dropdown */}
                  {isCompanyAdmin && (
                    <div className="relative">
                      <button
                        onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname.startsWith('/company')
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                        {t('navigation.company', { defaultValue: 'Company' })}
                        <ChevronDown className={`h-4 w-4 transition-transform ${showCompanyMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {showCompanyMenu && (
                        <div className="absolute top-full left-0 mt-1 w-48 glass-card rounded-lg py-1 shadow-lg z-50">
                          {companyManagementItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setShowCompanyMenu(false)}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                isActive(item.href)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground hover:bg-muted/50'
                              }`}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Admin link for Kaeyros users */}
              {isKaeyrosAdmin && (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    href="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Platform Admin
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {user?.firstName} {user?.lastName}
              </Link>
              <NotificationsDropdown />
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('navigation.logout')}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Sub-header with back button and page title */}
      {(showBackButton && !isDashboard) && (
        <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <BackButton />
              {title && (
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page title for dashboard */}
      {isDashboard && title && (
        <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>
      )}

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
