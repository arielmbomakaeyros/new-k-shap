'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { AdminStats } from '@/components/admin/AdminStats';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { AdminStats } from '@/src/components/admin/AdminStats';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

function AdminOverviewContent() {
  const { t } = useTranslation();

  const stats = [
    {
      label: 'Total Companies',
      value: '24',
      icon: '🏢',
      change: { value: 12, isPositive: true },
    },
    {
      label: 'Active Subscriptions',
      value: '21',
      icon: '💳',
      change: { value: 8, isPositive: true },
    },
    {
      label: 'Total Users',
      value: '487',
      icon: '👥',
      change: { value: 5, isPositive: true },
    },
    {
      label: 'Monthly Revenue',
      value: '$24,500',
      icon: '💰',
      change: { value: 15, isPositive: true },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor and manage all companies and subscriptions
          </p>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Companies */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Companies</h2>
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">Company {i}</p>
                    <p className="text-xs text-muted-foreground">company{i}@example.com</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full bg-transparent" variant="outline">
              View All Companies
            </Button>
          </div>

          {/* Subscription Alerts */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Subscription Alerts</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                <p className="font-semibold">Company A - Expiring Soon</p>
                <p className="text-xs">Subscription expires in 5 days</p>
              </div>
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                <p className="font-semibold">Company B - Expired</p>
                <p className="text-xs">Subscription expired 3 days ago</p>
              </div>
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-semibold">Company C - New Signup</p>
                <p className="text-xs">Just signed up 2 hours ago</p>
              </div>
              <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                <p className="font-semibold">Company D - Upgrade Available</p>
                <p className="text-xs">Check subscription plan options</p>
              </div>
            </div>
            <Button className="mt-4 w-full bg-transparent" variant="outline">
              View All Alerts
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full">Create Company</Button>
            <Button variant="outline" className="w-full bg-transparent">
              Manage Subscriptions
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              View Reports
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              System Settings
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <AdminOverviewContent />
    </ProtectedRoute>
  );
}
