'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { useCollections } from '@/src/hooks/queries';
import type { PaymentType } from '@/src/services';

function CollectionsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentType, setFilterPaymentType] = useState<PaymentType | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build filters for API
  const filters = useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    paymentType: filterPaymentType !== 'all' ? filterPaymentType : undefined,
  }), [page, limit, searchTerm, filterPaymentType]);

  // Fetch collections from API
  const { data: collectionsData, isLoading, error } = useCollections(filters);

  // Calculate stats from data
  const stats = useMemo(() => {
    const collections = collectionsData?.data ?? [];
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
    const averageAmount = collections.length > 0 ? totalCollected / collections.length : 0;
    return {
      totalCollected,
      totalTransactions: collectionsData?.pagination?.total ?? collections.length,
      averageAmount,
    };
  }, [collectionsData]);

  // Loading state
  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('collections.loading')}</span>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('collections.loadFailed')}</p>
        </div>
      </section>
    );
  }

  const collections = collectionsData?.data ?? [];
  const pagination = collectionsData?.pagination;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('navigation.collections')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('collections.subtitle')}
          </p>
        </div>
        <Button onClick={() => router.push('/collections/new')}>
          + {t('collections.newCollection')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.totalCollectedPage')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            USD {stats.totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.totalTransactions')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {stats.totalTransactions}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t('collections.averageTransaction')}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            USD {stats.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder={t('collections.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
        />
        <select
          value={filterPaymentType}
          onChange={(e) => {
            setFilterPaymentType(e.target.value as PaymentType | 'all');
            setPage(1);
          }}
          className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
        >
          <option value="all">{t('collections.allPaymentTypes')}</option>
          <option value="cash">{t('collections.paymentTypes.cash')}</option>
          <option value="check">{t('collections.paymentTypes.check')}</option>
          <option value="transfer">{t('collections.paymentTypes.transfer')}</option>
          <option value="credit">{t('collections.paymentTypes.credit')}</option>
          <option value="other">{t('collections.paymentTypes.other')}</option>
        </select>
      </div>

      {/* Results count */}
      {pagination && (
        <div className="mb-4 text-sm text-muted-foreground">
          {t('collections.showingOf', { count: collections.length, total: pagination.total })}
        </div>
      )}

      {/* Empty State */}
      {collections.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
          <p className="text-muted-foreground">{t('collections.noCollections')}</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/collections/new')}
          >
            {t('collections.recordFirst')}
          </Button>
        </div>
      )}

      {/* Table */}
      {collections.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('collections.seller')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('collections.buyer')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('common.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('collections.paymentMethod')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('collections.productType')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('common.created')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {collection.sellerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {collection.buyerName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {collection.currency} {collection.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground capitalize">
                      {collection.paymentType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {collection.productType}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/collections/${collection.id}`)}
                      >
                        {t('common.view')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function CollectionsPage() {
  return (
    <ProtectedRoute>
      <ProtectedLayout showBackButton={false}>
        <CollectionsContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
