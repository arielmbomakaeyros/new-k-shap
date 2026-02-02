'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { StatusBadge } from '@/components/disbursement/StatusBadge';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function DisbursementsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const disbursements = [
    {
      id: '1',
      title: 'Office Supplies',
      amount: 500,
      currency: 'USD',
      status: 'pending_department_head',
      createdAt: '2024-01-15',
      payee: 'ABC Supplies',
      department: 'Finance',
    },
    {
      id: '2',
      title: 'Equipment Purchase',
      amount: 2500,
      currency: 'USD',
      status: 'pending_validator',
      createdAt: '2024-01-14',
      payee: 'Tech Corp',
      department: 'IT',
    },
  ];

  const filtered = disbursements.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.payee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('navigation.disbursements')}
            </h1>
            <Button onClick={() => router.push('/disbursements/new')}>New Request</Button>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search disbursements..."
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
            <option value="draft">Draft</option>
            <option value="pending_department_head">Awaiting Dept Head</option>
            <option value="pending_validator">Awaiting Validator</option>
            <option value="pending_cashier">Awaiting Disbursement</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Payee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((disbursement) => (
                <tr key={disbursement.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground">{disbursement.title}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{disbursement.payee}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {disbursement.currency} {disbursement.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{disbursement.department}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={disbursement.status as any} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{disbursement.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/disbursements/${disbursement.id}`)}
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
            <p className="text-muted-foreground">No disbursements found</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function DisbursementsPage() {
  return (
    <ProtectedRoute>
      <DisbursementsContent />
    </ProtectedRoute>
  );
}
