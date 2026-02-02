'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useDisbursements } from '@/src/hooks/queries';
import type { DisbursementStatus } from '@/src/services';

function DisbursementsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DisbursementStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build filters for API
  const filters = useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  }), [page, limit, searchTerm, filterStatus]);

  // Fetch disbursements from API
  const { data: disbursementsData, isLoading, error } = useDisbursements(filters);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border">
          <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('navigation.disbursements')}
            </h1>
          </nav>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading disbursements...</span>
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
              {t('navigation.disbursements')}
            </h1>
          </nav>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Failed to load disbursements. Please try again.</p>
          </div>
        </section>
      </main>
    );
  }

  const disbursements = disbursementsData?.data ?? [];
  const pagination = disbursementsData?.pagination;

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as DisbursementStatus | 'all');
              setPage(1); // Reset to first page on filter change
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved_by_head">Approved by Head</option>
            <option value="approved_by_validator">Approved by Validator</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Results count */}
        {pagination && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {disbursements.length} of {pagination.total} disbursements
          </div>
        )}

        {/* Empty State */}
        {disbursements.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">No disbursements found</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/disbursements/new')}
            >
              Create your first disbursement
            </Button>
          </div>
        )}

        {/* Table */}
        {disbursements.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Beneficiary</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {disbursements.map((disbursement) => (
                    <tr key={disbursement.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {disbursement.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {disbursement.beneficiary?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {disbursement.currency} {disbursement.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {disbursement.type?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={disbursement.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(disbursement.createdAt).toLocaleDateString()}
                      </td>
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

export default function DisbursementsPage() {
  return (
    <ProtectedRoute>
      <DisbursementsContent />
    </ProtectedRoute>
  );
}
