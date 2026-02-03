'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';

function CollectionsAnalyticsContent() {
  const { t } = useTranslation();
  const analyticsData = {
    totalCollected: 500000,
    thisMonth: 45000,
    thisYear: 450000,
    averagePerMonth: 37500,
    totalTransactions: 125,
    averagePerTransaction: 4000,
    largestTransaction: 15000,
    smallestTransaction: 100,
  };

  const topPayers = [
    { name: 'Tech Corp Inc', amount: 85000, transactions: 8 },
    { name: 'Global Solutions Ltd', amount: 62000, transactions: 12 },
    { name: 'Digital Innovations', amount: 45000, transactions: 5 },
    { name: 'Enterprise Systems', amount: 38000, transactions: 4 },
    { name: 'Professional Services Inc', amount: 32000, transactions: 6 },
  ];

  const byPaymentMethod = [
    { method: 'Bank Transfer', count: 75, amount: 320000, percentage: 64 },
    { method: 'Check', count: 30, amount: 95000, percentage: 19 },
    { method: 'Cash', count: 15, amount: 60000, percentage: 12 },
    { method: 'Credit Card', count: 5, amount: 25000, percentage: 5 },
  ];

  const byDepartment = [
    { department: 'Sales', amount: 300000, percentage: 60, color: 'bg-blue-500' },
    { department: 'Operations', amount: 120000, percentage: 24, color: 'bg-green-500' },
    { department: 'Finance', amount: 50000, percentage: 10, color: 'bg-yellow-500' },
    { department: 'Administration', amount: 30000, percentage: 6, color: 'bg-purple-500' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('collections.analytics.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('collections.analytics.subtitle')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.analytics.totalAllTime')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            USD {analyticsData.totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.analytics.thisYear')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            USD {analyticsData.thisYear.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.analytics.averagePerMonth')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            USD {analyticsData.averagePerMonth.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.totalTransactions')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {analyticsData.totalTransactions}
          </p>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('collections.analytics.transactionStats')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('collections.analytics.averagePerTransaction')}</span>
              <span className="font-semibold text-foreground">
                USD {analyticsData.averagePerTransaction.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('collections.analytics.largestTransaction')}</span>
              <span className="font-semibold text-foreground">
                USD {analyticsData.largestTransaction.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('collections.analytics.smallestTransaction')}</span>
              <span className="font-semibold text-foreground">
                USD {analyticsData.smallestTransaction.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('collections.analytics.monthlyTrend')}</h3>
          <div className="space-y-2">
            {[37000, 42000, 38000, 45000, 41000, 48000].map((amount, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">Month {i + 1}</span>
                <div className="flex-1 bg-muted rounded h-2">
                  <div
                    className="bg-primary h-2 rounded"
                    style={{ width: `${(amount / 50000) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-16 text-right">
                  USD {(amount / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-lg border border-border bg-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('collections.analytics.byPaymentMethod')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  {t('collections.analytics.method')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  {t('collections.analytics.count')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  {t('common.amount')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  {t('collections.analytics.percentage')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {byPaymentMethod.map((item) => (
                <tr key={item.method}>
                  <td className="px-4 py-3 text-sm text-foreground">{item.method}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {item.count}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    USD {item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {item.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('collections.analytics.byDepartment')}</h3>
          <div className="space-y-4">
            {byDepartment.map((item) => (
              <div key={item.department}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {item.department}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  USD {item.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('collections.analytics.topPayers')}</h3>
          <div className="space-y-3">
            {topPayers.map((payer, index) => (
              <div key={index} className="flex justify-between items-start pb-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{payer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {payer.transactions} {t('collections.analytics.transactions')}
                  </p>
                </div>
                <p className="font-semibold text-foreground text-right">
                  USD {payer.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CollectionsAnalyticsPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('collections.analytics.title')}>
        <CollectionsAnalyticsContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
