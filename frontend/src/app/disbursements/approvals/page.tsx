'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';

function ApprovalsContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  const pendingApprovals = [
    {
      id: '1',
      title: 'Office Supplies Purchase',
      amount: 500,
      currency: 'USD',
      status: 'pending_department_head',
      stage: 'Department Head Approval',
      createdBy: 'John Doe',
      createdAt: '2024-01-15',
      payee: 'ABC Supplies',
    },
    {
      id: '2',
      title: 'Equipment Purchase',
      amount: 2500,
      currency: 'USD',
      status: 'pending_validator',
      stage: 'Validator Approval',
      createdBy: 'Jane Smith',
      createdAt: '2024-01-14',
      payee: 'Tech Corp',
    },
    {
      id: '3',
      title: 'Travel Expenses',
      amount: 1200,
      currency: 'USD',
      status: 'pending_cashier',
      stage: 'Disbursement',
      createdBy: 'Mike Johnson',
      createdAt: '2024-01-13',
      payee: 'John Doe',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('disbursements.pendingApprovals')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('disbursements.awaitingAction')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('disbursements.totalPending')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{pendingApprovals.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('disbursements.totalAmount')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">USD 4,200</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('disbursements.oldestRequest')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">5 {t('disbursements.days')}</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {pendingApprovals.map((approval) => (
          <div
            key={approval.id}
            className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/disbursements/${approval.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{approval.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  From: {approval.createdBy} • To: {approval.payee}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">
                    {approval.stage}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('disbursements.requested')} {approval.createdAt}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {approval.currency} {approval.amount}
                </p>
                <Button
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/disbursements/${approval.id}`);
                  }}
                >
                  {t('disbursements.review')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingApprovals.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
          <p className="text-muted-foreground text-lg">{t('disbursements.noPendingApprovals')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('disbursements.allProcessed')}</p>
        </div>
      )}
    </section>
  );
}

export default function ApprovalsPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('disbursements.pendingApprovals')}>
        <ApprovalsContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
