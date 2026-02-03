'use client';

import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useTranslation } from '@/node_modules/react-i18next';
import { formatPrice } from '@/src/lib/format';

function AnalyticsContent() {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="mt-2 text-muted-foreground">View platform usage and financial metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">12,543</p>
            <p className="mt-2 text-xs text-green-600">↑ 12% from last month</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Disbursements</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{formatPrice(325200000)}</p>
            <p className="mt-2 text-xs text-green-600">↑ 8% from last month</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Avg. Response Time</p>
            <p className="mt-2 text-3xl font-bold text-foreground">2.3s</p>
            <p className="mt-2 text-xs text-green-600">↑ 5% improvement</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Revenue Trend</h2>
            <div className="mt-4 flex h-64 items-center justify-center bg-muted/50 rounded text-muted-foreground">
              <p className="text-center">
                Chart component<br/>
                (Recharts integration)
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Active Companies</h2>
            <div className="mt-4 flex h-64 items-center justify-center bg-muted/50 rounded text-muted-foreground">
              <p className="text-center">
                Chart component<br/>
                (Recharts integration)
              </p>
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Top Companies by Revenue</h2>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Tech Innovations', revenue: 27000000, users: 23 },
              { name: 'Acme Corp', revenue: 19200000, users: 15 },
              { name: 'Global Solutions', revenue: 16800000, users: 18 },
              { name: 'Future Enterprises', revenue: 13200000, users: 12 },
              { name: 'Innovation Hub', revenue: 10800000, users: 9 },
            ].map((company, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <div>
                  <p className="font-medium text-foreground">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.users} users</p>
                </div>
                <p className="font-semibold text-foreground">{formatPrice(company.revenue)}</p>
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
