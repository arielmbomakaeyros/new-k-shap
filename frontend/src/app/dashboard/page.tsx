'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { formatPrice } from '@/src/lib/format';

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();

  // Check user roles for conditional rendering
  const isKaeyrosAdmin = user?.systemRoles?.some(role =>
    ['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support'].includes(role)
  );
  const isCompanyAdmin = user?.systemRoles?.some(role =>
    ['company_super_admin', 'company_admin'].includes(role)
  );

  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('navigation.dashboard')}>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">{t('navigation.dashboard')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('dashboard.welcomeBack', {
                defaultValue: 'Welcome back, {{name}}! You\'re logged in as {{role}}.',
                name: `${user?.firstName} ${user?.lastName}`,
                role: user?.systemRoles?.[0]?.replace(/_/g, ' ')
              })}
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="glass-card rounded-xl p-6 hover:glow-primary transition-all duration-300">
              <div className="text-sm text-muted-foreground">{t('navigation.disbursements')}</div>
              <div className="mt-2 text-3xl font-bold gradient-text">0</div>
            </div>

            <div className="glass-card rounded-xl p-6 hover:glow-secondary transition-all duration-300">
              <div className="text-sm text-muted-foreground">{t('navigation.collections')}</div>
              <div className="mt-2 text-3xl font-bold gradient-text">{formatPrice(0)}</div>
            </div>

            <div className="glass-card rounded-xl p-6 hover:glow-accent transition-all duration-300">
              <div className="text-sm text-muted-foreground">{t('dashboard.pendingApprovals', { defaultValue: 'Pending Approvals' })}</div>
              <div className="mt-2 text-3xl font-bold gradient-text">0</div>
            </div>

            <div className="glass-card rounded-xl p-6 hover:glow-primary transition-all duration-300">
              <div className="text-sm text-muted-foreground">{t('navigation.users', { defaultValue: 'Users' })}</div>
              <div className="mt-2 text-3xl font-bold gradient-text">0</div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <button
              onClick={() => router.push('/disbursements')}
              className="glass-card rounded-xl p-6 cursor-pointer text-left group"
            >
              <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">{t('navigation.disbursements')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('dashboard.manageDisbursements', { defaultValue: 'Manage and track disbursements with approval workflows.' })}
              </p>
              <Button className="mt-4 btn-3d" variant="outline" size="sm">
                {t('common.view', { defaultValue: 'View' })}
              </Button>
            </button>

            <button
              onClick={() => router.push('/collections')}
              className="glass-card rounded-xl p-6 cursor-pointer text-left group"
            >
              <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">{t('navigation.collections')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('dashboard.trackCollections', { defaultValue: 'Track incoming payments and cash inflows.' })}
              </p>
              <Button className="mt-4 btn-3d" variant="outline" size="sm">
                {t('common.view', { defaultValue: 'View' })}
              </Button>
            </button>

            {/* Company Settings - Only for company users */}
            {!isKaeyrosAdmin && (
              <button
                onClick={() => router.push('/company/settings')}
                className="glass-card rounded-xl p-6 cursor-pointer text-left group"
              >
                <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">{t('navigation.settings')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('dashboard.configureSettings', { defaultValue: 'Configure company settings and preferences.' })}
                </p>
                <Button className="mt-4 btn-3d" variant="outline" size="sm">
                  {t('common.view', { defaultValue: 'View' })}
                </Button>
              </button>
            )}

            {/* Platform Admin - Only for Kaeyros admins */}
            {isKaeyrosAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="glass-card rounded-xl p-6 cursor-pointer text-left group gradient-border glow-primary"
              >
                <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">Platform Admin</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage all companies, users, and platform settings.
                </p>
                <Button className="mt-4 btn-3d gradient-bg-primary text-white" size="sm">
                  {t('common.view', { defaultValue: 'View' })}
                </Button>
              </button>
            )}
          </div>

          {/* Company Management Section - Only for company admins */}
          {isCompanyAdmin && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold gradient-text mb-6">Company Management</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <button
                  onClick={() => router.push('/company/users')}
                  className="glass-card rounded-xl p-4 cursor-pointer text-left group"
                >
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Users</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Manage company users</p>
                </button>

                <button
                  onClick={() => router.push('/company/departments')}
                  className="glass-card rounded-xl p-4 cursor-pointer text-left group"
                >
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Departments</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Manage departments</p>
                </button>

                <button
                  onClick={() => router.push('/company/offices')}
                  className="glass-card rounded-xl p-4 cursor-pointer text-left group"
                >
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Offices</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Manage office locations</p>
                </button>

                <button
                  onClick={() => router.push('/company/roles')}
                  className="glass-card rounded-xl p-4 cursor-pointer text-left group"
                >
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Roles</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Manage roles & permissions</p>
                </button>
              </div>
            </div>
          )}
        </section>
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
