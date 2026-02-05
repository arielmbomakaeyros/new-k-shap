'use client';

import Link from 'next/link';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import {
  useProfile,
  useUsers,
  useDisbursements,
  useDepartments,
  useOffices,
  useNotifications,
} from '@/src/hooks/queries';

function CompanyDashboardContent() {
  const { t } = useTranslation();
  const { data: profileData } = useProfile();
  const { data: usersData } = useUsers({ page: 1, limit: 1 });
  const { data: disbursementsData } = useDisbursements({ page: 1, limit: 1, isCompleted: false });
  const { data: departmentsData } = useDepartments({ page: 1, limit: 1 });
  const { data: officesData } = useOffices({ page: 1, limit: 1 });
  const { data: notificationsData } = useNotifications({ page: 1, limit: 5 });

  const companyName = profileData?.company?.name || t('users.companyTitle', { defaultValue: 'Company' });
  const stats = [
    {
      label: t('dashboard.totalUsers', { defaultValue: 'Total Users' }),
      value: usersData?.pagination?.total ?? usersData?.data?.length ?? 0,
      icon: '👥',
    },
    {
      label: t('dashboard.activeDisbursements', { defaultValue: 'Active Disbursements' }),
      value: disbursementsData?.pagination?.total ?? disbursementsData?.data?.length ?? 0,
      icon: '💸',
    },
    {
      label: t('dashboard.departments', { defaultValue: 'Departments' }),
      value: departmentsData?.pagination?.total ?? departmentsData?.data?.length ?? 0,
      icon: '🏛️',
    },
    {
      label: t('dashboard.offices', { defaultValue: 'Offices' }),
      value: officesData?.pagination?.total ?? officesData?.data?.length ?? 0,
      icon: '🏢',
    },
  ];
  const notifications = notificationsData?.data ?? [];

  return (
    <CompanyLayout companyName={companyName}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.companyTitle', { defaultValue: 'Company Dashboard' })}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('dashboard.companySubtitle', { defaultValue: "Manage your company's users, departments, and settings" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              <span className="mt-2 text-2xl">{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* User Management */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">User Management</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add, manage, and assign roles to your team members
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
              <Link href="/company/users">Manage Users</Link>
            </Button>
          </div>

          {/* Organization Structure */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Organization Structure</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create departments and offices for better organization
            </p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 bg-transparent" variant="outline" asChild>
                <Link href="/company/departments">Departments</Link>
              </Button>
              <Button className="flex-1 bg-transparent" variant="outline" asChild>
                <Link href="/company/offices">Offices</Link>
              </Button>
            </div>
          </div>

          {/* Beneficiaries */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Beneficiaries</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add and manage payees for disbursements
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
              <Link href="/company/beneficiaries">Manage Beneficiaries</Link>
            </Button>
          </div>

          {/* Disbursement Types */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Disbursement Types</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Define and organize disbursement categories
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
              <Link href="/company/disbursement-types">Manage Disbursement Types</Link>
            </Button>
          </div>

          {/* Roles & Permissions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Roles & Permissions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Define custom roles and assign specific permissions to users
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
              <Link href="/company/roles">Configure Roles</Link>
            </Button>
          </div>

          {/* Company Settings */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Company Settings</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update company information and preferences
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
              <Link href="/company/settings">Edit Settings</Link>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {t('dashboard.recentActivity', { defaultValue: 'Recent Activity' })}
          </h2>
          {notifications.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t('dashboard.noRecentActivity', { defaultValue: 'No recent activity yet.' })}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id || notification._id}
                  className="flex items-center justify-between border-b border-border py-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      notification.read
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {notification.read
                      ? t('dashboard.read', { defaultValue: 'Read' })
                      : t('dashboard.new', { defaultValue: 'New' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function CompanyPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin', 'validator', 'department_head']}>
      <CompanyDashboardContent />
    </ProtectedRoute>
  );
}
