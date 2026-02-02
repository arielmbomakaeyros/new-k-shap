'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { StatusBadge } from '@/components/disbursement/StatusBadge';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function ApprovalsContent() {
  const router = useRouter();
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
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Pending Approvals
          </h1>
          <p className="mt-2 text-muted-foreground">
            Requests awaiting your action
          </p>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{pendingApprovals.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="mt-2 text-3xl font-bold text-foreground">USD 4,200</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Oldest Request</p>
            <p className="mt-2 text-3xl font-bold text-foreground">5 days</p>
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
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                      {approval.stage}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Requested {approval.createdAt}
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
                    Review
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingApprovals.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground text-lg">No pending approvals</p>
            <p className="text-sm text-muted-foreground mt-2">All requests have been processed</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ApprovalsPage() {
  return (
    <ProtectedRoute>
      <ApprovalsContent />
    </ProtectedRoute>
  );
}
