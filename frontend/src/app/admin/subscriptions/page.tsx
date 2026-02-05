'use client';

import { useState } from 'react';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useTranslation } from '@/node_modules/react-i18next';
import { useKaeyrosCompanies } from '@/src/hooks/queries/useKaeyros';

function SubscriptionsContent() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'expired'>('all');

  const { data: companiesData, isLoading, error } = useKaeyrosCompanies({
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });

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

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('subscriptions.loadFailed', { defaultValue: 'Failed to load subscriptions.' })}</p>
        </div>
      </AdminLayout>
    );
  }

  const companies = Array.isArray(companiesData?.data) ? companiesData.data : [];

  const activeSubscriptions = companies.filter((c: any) => c.subscriptionStatus === 'active').length;
  const expiringSoon = companies.filter((c: any) => {
    if (c.subscriptionStatus !== 'active' || !c.subscriptionEndDate) return false;
    const daysUntil = Math.ceil((new Date(c.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  }).length;
  const expiredCount = companies.filter((c: any) => c.subscriptionStatus === 'expired').length;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const daysUntilExpiry = (endDate: string | undefined) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('subscriptions.title', { defaultValue: 'Subscriptions' })}</h1>
            <p className="mt-2 text-muted-foreground">{t('subscriptions.subtitle', { defaultValue: 'Manage company subscriptions and plans' })}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('subscriptions.totalCompanies', { defaultValue: 'Total Companies' })}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{companies.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('subscriptions.active', { defaultValue: 'Active Subscriptions' })}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{activeSubscriptions}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('subscriptions.expiringSoon', { defaultValue: 'Expiring Soon' })}</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{expiringSoon}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{t('subscriptions.expired', { defaultValue: 'Expired' })}</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{expiredCount}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder={t('subscriptions.search', { defaultValue: 'Search by company name or email...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">{t('subscriptions.allStatus', { defaultValue: 'All Status' })}</option>
            <option value="active">{t('subscriptions.status.active', { defaultValue: 'Active' })}</option>
            <option value="inactive">{t('subscriptions.status.inactive', { defaultValue: 'Inactive' })}</option>
            <option value="suspended">{t('subscriptions.status.suspended', { defaultValue: 'Suspended' })}</option>
            <option value="expired">{t('subscriptions.status.expired', { defaultValue: 'Expired' })}</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          {t('subscriptions.showing', { defaultValue: 'Showing {{count}} of {{total}} companies', count: companies.length, total: companies.length })}
        </div>

        {companies.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">{t('subscriptions.empty', { defaultValue: 'No companies found.' })}</p>
          </div>
        )}

        {companies.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('subscriptions.company', { defaultValue: 'Company' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('subscriptions.email', { defaultValue: 'Email' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('subscriptions.statusLabel', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('subscriptions.plan', { defaultValue: 'Plan' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('subscriptions.expiry', { defaultValue: 'Expiry' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((company: any) => (
                  <tr key={company.id || company._id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{company.name}</td>
                    <td className="px-4 py-3 text-sm">{company.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(company.subscriptionStatus)}`}>
                        {company.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{company.planType || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {company.subscriptionEndDate ? new Date(company.subscriptionEndDate).toLocaleDateString() : '-'}
                      {company.subscriptionEndDate && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({daysUntilExpiry(company.subscriptionEndDate)} {t('common.days', { defaultValue: 'days' })})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <SubscriptionsContent />
    </ProtectedRoute>
  );
}
