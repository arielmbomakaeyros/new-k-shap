'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { useParams } from 'next/navigation';
import { CollectionStatusBadge } from '@/src/components/collection/CollectionStatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { useCollection } from '@/src/hooks/queries/useCollections';
import { formatPrice } from '@/src/lib/format';

function CollectionDetailContent() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;

  const { data: collection, isLoading, error } = useCollection(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</span>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{t('collections.loadFailed', { defaultValue: 'Failed to load collection.' })}</p>
      </div>
    );
  }

  const attachments = collection.attachments || [];
  const status = collection.isFullyPaid ? 'reconciled' : 'pending';

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {collection.referenceNumber}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('collections.collectionRecord')}</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('collections.status', { defaultValue: 'Status' })}</p>
                <div className="mt-2">
                  <CollectionStatusBadge status={status as any} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('collections.amount', { defaultValue: 'Amount' })}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{formatPrice(collection.amount)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('collections.payerInfo')}</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('collections.payerName')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.buyerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('collections.paymentMethod')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.paymentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.email')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.buyerEmail || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.phone')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.buyerPhone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.department')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.department?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.office')}</p>
                <p className="mt-1 font-medium text-foreground">{collection.office?.name || '—'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('collections.notes', { defaultValue: 'Notes' })}</h2>
            <p className="text-sm text-muted-foreground">{collection.comment || '—'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('collections.attachments', { defaultValue: 'Attachments' })}</h3>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('collections.noAttachments', { defaultValue: 'No attachments' })}</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((url: string, idx: number) => (
                  <a key={idx} href={url} className="block text-sm text-primary underline" target="_blank" rel="noreferrer">
                    {t('common.attachment', { defaultValue: 'Attachment' })} {idx + 1}
                  </a>
                ))}
              </div>
            )}
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
      <ProtectedLayout title={t('collections.view', { defaultValue: 'View Collection' })}>
        <CollectionDetailContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
