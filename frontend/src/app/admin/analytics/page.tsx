'use client';

import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useTranslation } from '@/node_modules/react-i18next';
import { formatPrice } from '@/src/lib/format';
import { useKaeyrosStats } from '@/src/hooks/queries/useKaeyros';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';

function AnalyticsContent() {
  const { t } = useTranslation();
  const { data: stats, isLoading, error } = useKaeyrosStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('analytics.loadFailed', { defaultValue: 'Failed to load analytics.' })}</p>
        </div>
      </AdminLayout>
    );
  }

  const monthly = stats.monthly || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('analytics.title', { defaultValue: 'Analytics' })}</h1>
          <p className="mt-2 text-muted-foreground">{t('analytics.subtitle', { defaultValue: 'View platform usage and financial metrics' })}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('analytics.totalCompanies', { defaultValue: 'Total Companies' })}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.totals.totalCompanies}</p>
            <p className="mt-2 text-xs text-green-600">{t('analytics.newCompanies', { defaultValue: 'Δ {{value}}% vs previous 30d', value: stats.trends.newCompaniesChange.toFixed(1) })}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('analytics.totalDisbursements', { defaultValue: 'Total Disbursements' })}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{formatPrice(stats.totals.disbursementAmount)}</p>
            <p className="mt-2 text-xs text-green-600">{t('analytics.disbursementChange', { defaultValue: 'Δ {{value}}% vs previous 30d', value: stats.trends.disbursementChange.toFixed(1) })}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('analytics.totalCollections', { defaultValue: 'Total Collections' })}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{formatPrice(stats.totals.collectionAmount)}</p>
            <p className="mt-2 text-xs text-green-600">{t('analytics.collectionChange', { defaultValue: 'Δ {{value}}% vs previous 30d', value: stats.trends.collectionChange.toFixed(1) })}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('analytics.newCompanies', { defaultValue: 'New Companies (Last 6 Months)' })}</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="newCompanies" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('analytics.newUsers', { defaultValue: 'New Users (Last 6 Months)' })}</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{t('analytics.disbursementVsCollections', { defaultValue: 'Disbursements vs Collections (Last 6 Months)' })}</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="disbursements" fill="#1d4ed8" name={t('analytics.totalDisbursements', { defaultValue: 'Disbursements' })} />
                <Bar dataKey="collections" fill="#0f766e" name={t('analytics.totalCollections', { defaultValue: 'Collections' })} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{t('analytics.topCompanies', { defaultValue: 'Top Companies by Disbursement' })}</h2>
          <div className="mt-4 space-y-3">
            {stats.topCompanies.map((company: any) => (
              <div key={company.companyId} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <div>
                  <p className="font-medium text-foreground">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.disbursementsCount} {t('analytics.transactions', { defaultValue: 'transactions' })}</p>
                </div>
                <p className="font-semibold text-foreground">{formatPrice(company.disbursementsTotal)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
