'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CollectionStatusBadge } from '@/src/components/collection/CollectionStatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { CollectionStatusBadge } from '@/components/collection/CollectionStatusBadge';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function CollectionDetailContent() {
  const router = useRouter();
  const params = useParams();

  // Mock collection data
  const collection = {
    id: params.id,
    referenceNumber: 'COL-2024-001',
    payer: 'Tech Corp Inc',
    payerType: 'customer',
    payerEmail: 'finance@techcorp.com',
    payerPhone: '+1-555-123-4567',
    invoiceNumber: 'INV-2024-045',
    amount: 5000,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    description: 'Service fees for Q1 2024',
    status: 'reconciled',
    department: 'Sales',
    office: 'New York',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'Sales Team',
    receivedAt: '2024-01-15T14:00:00Z',
    depositedAt: '2024-01-16T09:00:00Z',
    reconciledAt: '2024-01-17T16:30:00Z',
    notes: 'Payment received via wire transfer. Reference: TXN-2024-45678',
    bankAccount: 'Bank of America ...1234',
  };

  const timeline = [
    { stage: 'Created', timestamp: collection.createdAt, icon: '📝' },
    { stage: 'Received', timestamp: collection.receivedAt, icon: '✓' },
    { stage: 'Deposited', timestamp: collection.depositedAt, icon: '🏦' },
    { stage: 'Reconciled', timestamp: collection.reconciledAt, icon: '✓✓' },
  ];

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
                {collection.referenceNumber}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Download PDF</Button>
              <Button variant="outline">Print</Button>
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
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-2">
                    <CollectionStatusBadge status={collection.status as any} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {collection.currency} {collection.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payer Information</h2>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Payer Name</p>
                    <p className="mt-1 font-medium text-foreground">{collection.payer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payer Type</p>
                    <p className="mt-1 font-medium text-foreground capitalize">
                      {collection.payerType.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="mt-1 font-medium text-foreground">{collection.payerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="mt-1 font-medium text-foreground">{collection.payerPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Details</h2>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="mt-1 font-medium text-foreground">{collection.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="mt-1 font-medium text-foreground capitalize">
                      {collection.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="mt-1 font-medium text-foreground">{collection.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Office</p>
                    <p className="mt-1 font-medium text-foreground">{collection.office}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 font-medium text-foreground">{collection.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1 text-foreground">{collection.notes}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Processing Timeline</h2>

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.stage}</p>
                      <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">
                    {collection.currency} {collection.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {collection.currency} {collection.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Account */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Bank Account</h3>
              <p className="text-sm text-muted-foreground">{collection.bankAccount}</p>
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created By</p>
                  <p className="mt-1 font-medium text-foreground">{collection.createdBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created On</p>
                  <p className="mt-1 font-medium text-foreground">{collection.createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CollectionDetailPage() {
  return (
    <ProtectedRoute>
      <CollectionDetailContent />
    </ProtectedRoute>
  );
}
