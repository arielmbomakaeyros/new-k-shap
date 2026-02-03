'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { WorkflowTimeline } from '@/src/components/disbursement/WorkflowTimeline';
import { ApprovalDialog } from '@/src/components/disbursement/ApprovalDialog';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';

function DisbursementDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  // Mock disbursement data
  const disbursement = {
    id: params.id,
    title: 'Office Supplies Purchase',
    description: 'Monthly office supplies for the finance department',
    amount: 500,
    currency: 'USD',
    status: 'pending_department_head',
    payeeType: 'vendor',
    payeeName: 'ABC Supplies Inc',
    payeeEmail: 'contact@abcsupplies.com',
    payeePhone: '+1-555-123-4567',
    department: 'Finance',
    office: 'New York',
    justification: 'Regular office supplies needed for ongoing operations',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'John Doe',
    approvals: [
      {
        stage: 'department_head',
        approver_name: 'Jane Smith',
        action: 'pending',
        approved_at: null,
        notes: null,
      },
    ],
  };

  const canApprove = ['pending_department_head', 'pending_validator', 'pending_cashier'].includes(
    disbursement.status
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {disbursement.title}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('disbursements.requestNumber', { id: disbursement.id })}
          </p>
        </div>
        <div className="flex gap-3">
          {canApprove && (
            <Button onClick={() => setShowApprovalDialog(true)}>{t('disbursements.approveReview')}</Button>
          )}
          <Button variant="outline">{t('disbursements.downloadPdf')}</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('disbursements.currentStatus')}</p>
                <div className="mt-2">
                  <StatusBadge status={disbursement.status as any} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('disbursements.totalAmount')}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {disbursement.currency} {disbursement.amount}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('disbursements.requestDetails')}</h2>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.payeeName')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.payeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.payeeType')}</p>
                  <p className="mt-1 font-medium text-foreground">
                    {disbursement.payeeType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.email')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.payeeEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.phone')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.payeePhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('users.department')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('users.office')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.office}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{t('common.description')}</p>
                <p className="mt-1 text-foreground">{disbursement.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{t('disbursements.justification')}</p>
                <p className="mt-1 text-foreground">{disbursement.justification}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('disbursements.createdBy')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.createdBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('disbursements.createdOn')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="rounded-lg border border-border bg-card p-6">
            <WorkflowTimeline disbursement={disbursement as any} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {canApprove && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('common.actions')}</h3>
              <Button
                className="w-full"
                onClick={() => setShowApprovalDialog(true)}
              >
                {t('disbursements.reviewApprove')}
              </Button>
            </div>
          )}

          {/* Attachments (placeholder) */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('disbursements.attachments')}</h3>
            <p className="text-sm text-muted-foreground">{t('disbursements.noAttachments')}</p>
          </div>
        </div>
      </div>

      {showApprovalDialog && (
        <ApprovalDialog
          disbursementId={disbursement.id as string}
          stage="department_head"
          onClose={() => setShowApprovalDialog(false)}
          onSuccess={() => {
            setShowApprovalDialog(false);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

export default function DisbursementDetailPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('disbursements.view')}>
        <DisbursementDetailContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
