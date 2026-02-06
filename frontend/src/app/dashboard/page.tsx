'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { formatPrice } from '@/src/lib/format';
import { useDashboardReport } from '@/src/hooks/queries';

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'today' | 'this_week' | 'this_month' | 'this_year'>('this_month');
  const { data: dashboardData, isLoading } = useDashboardReport({ period });

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
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm text-muted-foreground">
              {t('dashboard.period', { defaultValue: 'Period' })}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="today">{t('dashboard.periods.today', { defaultValue: 'Today' })}</option>
              <option value="this_week">{t('dashboard.periods.thisWeek', { defaultValue: 'This week' })}</option>
              <option value="this_month">{t('dashboard.periods.thisMonth', { defaultValue: 'This month' })}</option>
              <option value="this_year">{t('dashboard.periods.thisYear', { defaultValue: 'This year' })}</option>
            </select>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-6 border border-border bg-muted/50 animate-pulse"
                >
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-4 h-8 w-20 rounded bg-muted" />
                </div>
              ))
            ) : (
              <>
                <div className="rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-100 hover:shadow-lg dark:from-blue-900/30 dark:via-slate-900 dark:to-blue-950/40 dark:border-blue-900/40">
                  <div className="text-sm text-blue-700 dark:text-blue-200">{t('navigation.disbursements')}</div>
                  <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-50">{dashboardData?.totalDisbursements ?? 0}</div>
                </div>

                <div className="rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100 hover:shadow-lg dark:from-emerald-900/30 dark:via-slate-900 dark:to-emerald-950/40 dark:border-emerald-900/40">
                  <div className="text-sm text-emerald-700 dark:text-emerald-200">{t('navigation.collections')}</div>
                  <div className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-50">
                    {formatPrice(dashboardData?.totalCollectionsAmount ?? 0)}
                  </div>
                </div>

                <div className="rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-amber-50 via-white to-amber-100 border border-amber-100 hover:shadow-lg dark:from-amber-900/30 dark:via-slate-900 dark:to-amber-950/40 dark:border-amber-900/40">
                  <div className="text-sm text-amber-700 dark:text-amber-200">{t('dashboard.pendingApprovals', { defaultValue: 'Pending Approvals' })}</div>
                  <div className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-50">{dashboardData?.pendingApprovals ?? 0}</div>
                </div>

                <div className="rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-violet-50 via-white to-violet-100 border border-violet-100 hover:shadow-lg dark:from-violet-900/30 dark:via-slate-900 dark:to-violet-950/40 dark:border-violet-900/40">
                  <div className="text-sm text-violet-700 dark:text-violet-200">{t('navigation.users', { defaultValue: 'Users' })}</div>
                  <div className="mt-2 text-3xl font-bold text-violet-900 dark:text-violet-50">{dashboardData?.totalUsers ?? 0}</div>
                </div>
              </>
            )}
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
            {isCompanyAdmin && (
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
