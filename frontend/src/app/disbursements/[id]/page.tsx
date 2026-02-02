'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { WorkflowTimeline } from '@/src/components/disbursement/WorkflowTimeline';
import { ApprovalDialog } from '@/src/components/disbursement/ApprovalDialog';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { StatusBadge } from '@/components/disbursement/StatusBadge';
// import { WorkflowTimeline } from '@/components/disbursement/WorkflowTimeline';
// import { ApprovalDialog } from '@/components/disbursement/ApprovalDialog';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function DisbursementDetailContent() {
  const router = useRouter();
  const params = useParams();
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
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.back()}>
                ← Back
              </Button>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                {disbursement.title}
              </h1>
            </div>
            <div className="flex gap-3">
              {canApprove && (
                <Button onClick={() => setShowApprovalDialog(true)}>Approve/Review</Button>
              )}
              <Button variant="outline">Download PDF</Button>
            </div>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <div className="mt-2">
                    <StatusBadge status={disbursement.status as any} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {disbursement.currency} {disbursement.amount}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Request Details</h2>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Payee Name</p>
                    <p className="mt-1 font-medium text-foreground">{disbursement.payeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payee Type</p>
                    <p className="mt-1 font-medium text-foreground">
                      {disbursement.payeeType.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="mt-1 font-medium text-foreground">{disbursement.payeeEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="mt-1 font-medium text-foreground">{disbursement.payeePhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="mt-1 font-medium text-foreground">{disbursement.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Office</p>
                    <p className="mt-1 font-medium text-foreground">{disbursement.office}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 text-foreground">{disbursement.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Justification</p>
                  <p className="mt-1 text-foreground">{disbursement.justification}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created By</p>
                    <p className="mt-1 font-medium text-foreground">{disbursement.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created On</p>
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
                <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                <Button
                  className="w-full"
                  onClick={() => setShowApprovalDialog(true)}
                >
                  Review & Approve
                </Button>
              </div>
            )}

            {/* Attachments (placeholder) */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Attachments</h3>
              <p className="text-sm text-muted-foreground">No attachments</p>
            </div>
          </div>
        </div>
      </section>

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
    </main>
  );
}

export default function DisbursementDetailPage() {
  return (
    <ProtectedRoute>
      <DisbursementDetailContent />
    </ProtectedRoute>
  );
}
