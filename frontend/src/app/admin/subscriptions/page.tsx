'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

interface Subscription {
  id: string;
  companyName: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  price: number;
  users: number;
}

function SubscriptionsContent() {
  const { t } = useTranslation();

  const subscriptions: Subscription[] = [
    {
      id: '1',
      companyName: 'Acme Corp',
      plan: 'Professional',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      price: 999,
      users: 15,
    },
    {
      id: '2',
      companyName: 'Tech Innovations',
      plan: 'Enterprise',
      status: 'active',
      startDate: new Date('2024-01-10'),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      price: 2999,
      users: 23,
    },
    {
      id: '3',
      companyName: 'Global Solutions',
      plan: 'Starter',
      status: 'expired',
      startDate: new Date('2023-12-20'),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      price: 299,
      users: 8,
    },
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const daysUntilExpiry = (endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
            <p className="mt-2 text-muted-foreground">Manage company subscriptions and plans</p>
          </div>
          <Button>+ New Subscription</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {subscriptions.filter((s) => s.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {subscriptions.filter((s) => s.status === 'active' && daysUntilExpiry(s.endDate) < 30).length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {subscriptions.filter((s) => s.status === 'expired').length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="mt-2 text-3xl font-bold text-foreground">$4,297</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Users</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price/Month</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Expires In</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{sub.companyName}</td>
                  <td className="px-4 py-3 text-sm">{sub.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(sub.status)}`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{sub.users}</td>
                  <td className="px-4 py-3 text-sm font-medium">${sub.price}</td>
                  <td className="px-4 py-3 text-sm">
                    {sub.status === 'active' ? (
                      <span className={daysUntilExpiry(sub.endDate) < 30 ? 'text-yellow-600 font-semibold' : ''}>
                        {daysUntilExpiry(sub.endDate)} days
                      </span>
                    ) : (
                      <span className="text-red-600">Expired</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Renew
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
