'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
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
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('disbursements.loading')}</span>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('disbursements.loadFailed')}</p>
        </div>
      </section>
    );
  }

  const disbursements = disbursementsData?.data ?? [];
  const pagination = disbursementsData?.pagination;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('navigation.disbursements')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('disbursements.subtitle')}
          </p>
        </div>
        <Button onClick={() => router.push('/disbursements/new')} className="btn-3d gradient-bg-primary text-white">
          + {t('disbursements.newRequest')}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder={t('disbursements.searchPlaceholder')}
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
          <option value="all">{t('disbursements.allStatus')}</option>
          <option value="draft">{t('disbursements.status.draft')}</option>
          <option value="pending_dept_head">{t('disbursements.status.pending_dept_head')}</option>
          <option value="pending_validator">{t('disbursements.status.pending_validator')}</option>
          <option value="pending_cashier">{t('disbursements.status.pending_cashier')}</option>
          <option value="completed">{t('disbursements.status.completed')}</option>
          <option value="rejected">{t('disbursements.status.rejected')}</option>
          <option value="cancelled">{t('disbursements.status.cancelled')}</option>
        </select>
      </div>

      {/* Results count */}
      {pagination && (
        <div className="mb-4 text-sm text-muted-foreground">
          {t('disbursements.showingOf', { count: disbursements.length, total: pagination.total })}
        </div>
      )}

      {/* Empty State */}
      {disbursements.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
          <p className="text-muted-foreground">{t('disbursements.noDisbursements')}</p>
          <Button
            className="mt-4 btn-3d gradient-bg-primary text-white"
            onClick={() => router.push('/disbursements/new')}
          >
            {t('disbursements.createFirst')}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.description')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('disbursements.beneficiary')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.amount')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.type')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.status')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.created')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disbursements.map((disbursement) => (
                  <tr key={disbursement.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {disbursement.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {disbursement.beneficiary?.name || disbursement.beneficiary?.email || 'N/A'}
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

export default function DisbursementsPage() {
  return (
    <ProtectedRoute>
      <ProtectedLayout showBackButton={false}>
        <DisbursementsContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
