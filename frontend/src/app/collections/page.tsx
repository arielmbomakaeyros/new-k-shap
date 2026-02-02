'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
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
      <main className="min-h-screen bg-background">
        <header className="border-b border-border">
          <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('navigation.collections')}
            </h1>
          </nav>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading collections...</span>
          </div>
        </section>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border">
          <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('navigation.collections')}
            </h1>
          </nav>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Failed to load collections. Please try again.</p>
          </div>
        </section>
      </main>
    );
  }

  const collections = collectionsData?.data ?? [];
  const pagination = collectionsData?.pagination;

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
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Collected (page)</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              USD {stats.totalCollected.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stats.totalTransactions}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Average Transaction</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              USD {stats.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search by seller or buyer..."
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
            <option value="all">All Payment Types</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="transfer">Bank Transfer</option>
            <option value="credit">Credit</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Results count */}
        {pagination && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {collections.length} of {pagination.total} collections
          </div>
        )}

        {/* Empty State */}
        {collections.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">No collections found</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/collections/new')}
            >
              Record your first collection
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
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Product Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Action
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
                          View
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
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
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
