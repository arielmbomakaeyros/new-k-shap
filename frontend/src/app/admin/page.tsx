'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { AdminStats } from '@/src/components/admin/AdminStats';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useCompanies, useUsers } from '@/src/hooks/queries';

function AdminOverviewContent() {
  const router = useRouter();

  // Fetch real data
  const { data: companiesData, isLoading: companiesLoading } = useCompanies();
  const { data: usersData, isLoading: usersLoading } = useUsers();

  const isLoading = companiesLoading || usersLoading;

  const companies = Array.isArray(companiesData?.data) ? companiesData.data : [];
  const users = Array.isArray(usersData?.data) ? usersData.data : [];

  // Calculate stats from real data
  const activeSubscriptions = companies.filter(c => c.subscriptionStatus === 'active').length;
  const expiringSoon = companies.filter(c => {
    if (c.subscriptionStatus !== 'active' || !c.subscriptionEndDate) return false;
    const daysUntil = Math.ceil((new Date(c.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  });
  const expiredCompanies = companies.filter(c => c.subscriptionStatus === 'expired');
  const newCompanies = companies.filter(c => {
    const daysSinceCreated = Math.ceil((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 7;
  });

  const stats = [
    {
      label: 'Total Companies',
      value: isLoading ? '...' : companies?.length?.toString(),
      icon: '🏢',
      change: { value: newCompanies.length, isPositive: true },
    },
    {
      label: 'Active Subscriptions',
      value: isLoading ? '...' : activeSubscriptions?.toString(),
      icon: '💳',
      change: { value: Math.round((activeSubscriptions / Math.max(companies?.length, 1)) * 100), isPositive: true },
    },
    {
      label: 'Total Users',
      value: isLoading ? '...' : users?.length?.toString(),
      icon: '👥',
      change: { value: users?.filter(u => u?.isActive)?.length, isPositive: true },
    },
    {
      label: 'Expiring Soon',
      value: isLoading ? '...' : expiringSoon?.length.toString(),
      icon: '⚠️',
      change: { value: expiringSoon?.length, isPositive: false },
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
            {isLoading ? (
              <div className="mt-4 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : companies.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No companies yet</p>
            ) : (
              <div className="mt-4 space-y-3">
                {companies.slice(0, 5).map((company, index) => (
                  <div key={company.id || index} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      company.subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : company.subscriptionStatus === 'expired'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {company.subscriptionStatus
                        ? company.subscriptionStatus.charAt(0).toUpperCase() + company.subscriptionStatus.slice(1)
                        : 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button
              className="mt-4 w-full bg-transparent"
              variant="outline"
              onClick={() => router.push('/admin/companies')}
            >
              View All Companies
            </Button>
          </div>

          {/* Subscription Alerts */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Subscription Alerts</h2>
            {isLoading ? (
              <div className="mt-4 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {expiringSoon.map((company, index) => (
                  <div key={`expiring-${company.id || index}`} className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold">{company.name} - Expiring Soon</p>
                    <p className="text-xs">
                      Subscription expires on {new Date(company.subscriptionEndDate!).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {expiredCompanies.slice(0, 2).map((company, index) => (
                  <div key={`expired-${company.id || index}`} className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                    <p className="font-semibold">{company.name} - Expired</p>
                    <p className="text-xs">Subscription has expired</p>
                  </div>
                ))}
                {newCompanies.slice(0, 2).map((company, index) => (
                  <div key={`new-${company.id || index}`} className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold">{company.name} - New Signup</p>
                    <p className="text-xs">
                      Signed up on {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {expiringSoon.length === 0 && expiredCompanies.length === 0 && newCompanies.length === 0 && (
                  <p className="text-sm text-muted-foreground">No alerts at this time</p>
                )}
              </div>
            )}
            <Button
              className="mt-4 w-full bg-transparent"
              variant="outline"
              onClick={() => router.push('/admin/subscriptions')}
            >
              View All Subscriptions
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full" onClick={() => router.push('/admin/companies')}>
              Manage Companies
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push('/admin/subscriptions')}
            >
              Manage Subscriptions
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push('/admin/users')}
            >
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push('/admin/settings')}
            >
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
