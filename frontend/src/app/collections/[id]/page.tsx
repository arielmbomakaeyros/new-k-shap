'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { CollectionStatusBadge } from '@/src/components/collection/CollectionStatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';

function CollectionDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();

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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {collection.referenceNumber}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('collections.collectionRecord')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">{t('disbursements.downloadPdf')}</Button>
          <Button variant="outline">{t('reports.print')}</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('common.status')}</p>
                <div className="mt-2">
                  <CollectionStatusBadge status={collection.status as any} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('common.amount')}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {collection.currency} {collection.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('collections.payerInfo')}</h2>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t('collections.payerName')}</p>
                  <p className="mt-1 font-medium text-foreground">{collection.payer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('collections.payerType')}</p>
                  <p className="mt-1 font-medium text-foreground capitalize">
                    {collection.payerType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.email')}</p>
                  <p className="mt-1 font-medium text-foreground">{collection.payerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.phone')}</p>
                  <p className="mt-1 font-medium text-foreground">{collection.payerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('collections.paymentDetails')}</h2>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t('collections.invoiceNumber')}</p>
                  <p className="mt-1 font-medium text-foreground">{collection.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('collections.paymentMethod')}</p>
                  <p className="mt-1 font-medium text-foreground capitalize">
                    {collection.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('users.department')}</p>
                  <p className="mt-1 font-medium text-foreground">{collection.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('users.office')}</p>
                  <p className="mt-1 font-medium text-foreground">{collection.office}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{t('common.description')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{t('collections.notes')}</p>
                <p className="mt-1 text-foreground">{collection.notes}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('collections.processingTimeline')}</h2>

            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex-shrink-0">
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
            <h3 className="font-semibold text-foreground mb-4">{t('common.summary')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.amount')}</span>
                <span className="font-medium text-foreground">
                  {collection.currency} {collection.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">{t('common.total')}</span>
                <span className="font-semibold text-foreground">
                  {collection.currency} {collection.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('collections.bankAccount')}</h3>
            <p className="text-sm text-muted-foreground">{collection.bankAccount}</p>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('collections.metadata')}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('collections.createdBy')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.createdBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('collections.createdOn')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CollectionDetailPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('collections.view')}>
        <CollectionDetailContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
