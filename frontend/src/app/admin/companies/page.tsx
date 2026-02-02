'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { CompaniesTable } from '@/components/admin/CompaniesTable';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/src/types';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { CompaniesTable } from '@/src/components/admin/CompaniesTable';
// import { SubscriptionStatus } from '@/types';

interface Company {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate?: Date;
  usersCount: number;
  createdAt: Date;
}

function CompaniesManagerContent() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Acme Corp',
      email: 'admin@acme.com',
      subscriptionStatus: SubscriptionStatus.Active,
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usersCount: 15,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Tech Innovations',
      email: 'admin@techinnovations.com',
      subscriptionStatus: SubscriptionStatus.Active,
      subscriptionEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usersCount: 23,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'Global Solutions',
      email: 'admin@globalsolutions.com',
      subscriptionStatus: SubscriptionStatus.Suspended,
      subscriptionEndDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      usersCount: 8,
      createdAt: new Date('2023-12-20'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all');

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.subscriptionStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSubscription = (id: string, status: SubscriptionStatus) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, subscriptionStatus: status } : c))
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Companies</h1>
            <p className="mt-2 text-muted-foreground">Manage all subscribed companies</p>
          </div>
          <Button>+ Create Company</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SubscriptionStatus | 'all')}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value={SubscriptionStatus.Active}>Active</option>
            <option value={SubscriptionStatus.Suspended}>Suspended</option>
            <option value={SubscriptionStatus.Inactive}>Inactive</option>
            <option value={SubscriptionStatus.Expired}>Expired</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>

        {/* Table */}
        <CompaniesTable
          companies={filteredCompanies}
          onEdit={(id) => console.log('Edit:', id)}
          onDelete={(id) => {
            setCompanies((prev) => prev.filter((c) => c.id !== id));
          }}
          onToggleSubscription={handleToggleSubscription}
        />
      </div>
    </AdminLayout>
  );
}

export default function CompaniesPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <CompaniesManagerContent />
    </ProtectedRoute>
  );
}
