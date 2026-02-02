'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CollectionStatusBadge } from '@/src/components/collection/CollectionStatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { CollectionStatusBadge } from '@/components/collection/CollectionStatusBadge';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function CollectionsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const collections = [
    {
      id: '1',
      referenceNumber: 'COL-2024-001',
      payer: 'Tech Corp Inc',
      amount: 5000,
      currency: 'USD',
      status: 'reconciled',
      paymentMethod: 'bank_transfer',
      receivedAt: '2024-01-15',
      createdAt: '2024-01-15',
      department: 'Sales',
    },
    {
      id: '2',
      referenceNumber: 'COL-2024-002',
      payer: 'Global Solutions Ltd',
      amount: 2500,
      currency: 'USD',
      status: 'deposited',
      paymentMethod: 'check',
      receivedAt: '2024-01-14',
      createdAt: '2024-01-14',
      department: 'Sales',
    },
    {
      id: '3',
      referenceNumber: 'COL-2024-003',
      payer: 'Digital Innovations',
      amount: 7500,
      currency: 'USD',
      status: 'received',
      paymentMethod: 'bank_transfer',
      receivedAt: '2024-01-13',
      createdAt: '2024-01-13',
      department: 'Operations',
    },
  ];

  const filtered = collections.filter((c) => {
    const matchesSearch =
      c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.payer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCollected: 15000,
    pendingCollection: 0,
    thisMonth: 15000,
    averageAmount: 5000,
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('navigation.collections')}
            </h1>
            <Button onClick={() => router.push('/collections/new')}>New Collection</Button>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              USD {stats.totalCollected.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              USD {stats.thisMonth.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Average Transaction</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              USD {stats.averageAmount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{collections.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search by reference or payer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="deposited">Deposited</option>
            <option value="reconciled">Reconciled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Payer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Received
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((collection) => (
                <tr key={collection.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {collection.referenceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{collection.payer}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {collection.currency} {collection.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {collection.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <CollectionStatusBadge status={collection.status as any} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {collection.receivedAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/collections/${collection.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">No collections found</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function CollectionsPage() {
  return (
    <ProtectedRoute>
      <CollectionsContent />
    </ProtectedRoute>
  );
}
  