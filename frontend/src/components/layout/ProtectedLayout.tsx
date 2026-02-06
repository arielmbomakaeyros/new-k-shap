'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/src/store/authStore';
import { useLogout } from '@/src/hooks/queries';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { BackButton } from '@/src/components/ui/BackButton';
import { Home, FileText, Wallet, Users, Building2, Settings, ChevronDown, Menu, X, UserCircle } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    { href: '/chat', label: t('navigation.chat', { defaultValue: 'Chat' }), icon: Users },
  ];

  const companyManagementItems = [
    { href: '/company/users', label: t('navigation.users') },
    { href: '/company/beneficiaries', label: t('navigation.beneficiaries') },
    { href: '/company/disbursement-types', label: t('navigation.disbursementTypes') },
    { href: '/company/payment-methods', label: t('navigation.paymentMethods') },
    { href: '/company/departments', label: t('navigation.departments') },
    { href: '/company/offices', label: t('navigation.offices') },
    { href: '/company/roles', label: t('navigation.roles') },
    { href: '/company/audit-logs', label: t('navigation.auditLogs') },
    { href: '/company/settings', label: t('navigation.settings') },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isDashboard = pathname === '/dashboard';
  const displayRole = user?.systemRoles?.[0]
    ? user.systemRoles[0].replace(/_/g, ' ')
    : t('navigation.userRole', { defaultValue: 'User' });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Mobile hamburger (left aligned) */}
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label={t('navigation.menu', { defaultValue: 'Menu' })}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link href="/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-2xl font-bold gradient-text">
                  {t('common.appName', { defaultValue: 'K-shap' })}
                </div>
                {user?.company?.name && (
                  <div className="hidden sm:block text-xs text-muted-foreground">
                    {user.company.name}
                  </div>
                )}
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
                        {t('navigation.company')}
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
              <NotificationsDropdown />
              <LanguageSwitcher />
              <ThemeSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('navigation.profile')}>
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user?.firstName || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-7 w-7" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-sm">
                    <div className="font-semibold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full items-center justify-between">
                      <span>{t('navigation.profile')}</span>
                      <span className="text-xs text-muted-foreground">{displayRole}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full items-center justify-between">
                      <span>{t('navigation.phone', { defaultValue: 'Phone' })}</span>
                      <span className="text-xs text-muted-foreground">{user?.phone || '—'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    {t('navigation.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="md:hidden glass border-b border-white/20">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {user?.company?.name && (
              <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {user.company.name}
              </div>
            )}
            {!isKaeyrosAdmin && (
              <>
                {companyNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {isCompanyAdmin && (
                  <>
                    <div className="border-t border-border/50 my-2" />
                    <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                      {t('navigation.company')}
                    </p>
                    {companyManagementItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
            {isKaeyrosAdmin && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  {t('navigation.dashboard')}
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Platform Admin
                </Link>
              </>
            )}
          </div>
        </div>
      )}

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
