'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { CompanyLayout } from '@/components/company/CompanyLayout';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

function CompanyDashboardContent() {
  const { t } = useTranslation();

  const stats = [
    { label: 'Total Users', value: '12', icon: '👥' },
    { label: 'Active Disbursements', value: '8', icon: '💸' },
    { label: 'Departments', value: '3', icon: '🏛️' },
    { label: 'Offices', value: '2', icon: '🏢' },
  ];

  return (
    <CompanyLayout companyName="Acme Corporation">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your company's users, departments, and settings
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
            <Button className="mt-4 w-full bg-transparent" variant="outline">
              Manage Users
            </Button>
          </div>

          {/* Organization Structure */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Organization Structure</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create departments and offices for better organization
            </p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 bg-transparent" variant="outline">
                Departments
              </Button>
              <Button className="flex-1 bg-transparent" variant="outline">
                Offices
              </Button>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Roles & Permissions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Define custom roles and assign specific permissions to users
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline">
              Configure Roles
            </Button>
          </div>

          {/* Company Settings */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Company Settings</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update company information and preferences
            </p>
            <Button className="mt-4 w-full bg-transparent" variant="outline">
              Edit Settings
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <div>
                <p className="font-medium text-foreground">John Doe invited to company</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Completed
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <div>
                <p className="font-medium text-foreground">Finance Department created</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Completed
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <div>
                <p className="font-medium text-foreground">Company settings updated</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Completed
              </span>
            </div>
          </div>
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
