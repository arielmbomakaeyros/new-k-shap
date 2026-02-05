'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { useBeneficiaries, useDepartments, useDisbursementTypes, useDisbursements, useOffices, usePaymentMethods } from '@/src/hooks/queries';
import type { DisbursementStatus } from '@/src/services';
import { formatPrice } from '@/src/lib/format';
import { Sheet, SheetBody, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/src/components/ui';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/src/components/ui/modal';
import axiosClient from '@/src/lib/axios';

function DisbursementsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DisbursementStatus | 'all'>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedDisbursement, setSelectedDisbursement] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [exportFilters, setExportFilters] = useState({
    search: '',
    status: [] as string[],
    paymentMethod: [] as string[],
    department: [] as string[],
    office: [] as string[],
    beneficiary: [] as string[],
    disbursementType: [] as string[],
    priority: [] as string[],
    isUrgent: 'all' as 'all' | 'true' | 'false',
    isRetroactive: 'all' as 'all' | 'true' | 'false',
    isCompleted: 'all' as 'all' | 'true' | 'false',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    tags: [] as string[],
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [tagInput, setTagInput] = useState('');
  const limit = 10;

  // Build filters for API
  const filters = useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    paymentMethod: filterPaymentMethod !== 'all' ? filterPaymentMethod : undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  }), [page, limit, searchTerm, filterStatus, filterPaymentMethod, minAmount, maxAmount, startDate, endDate, sortBy, sortOrder]);

  // Fetch disbursements from API
  const { data: disbursementsData, isLoading, error } = useDisbursements(filters);
  const { data: paymentMethodsData } = usePaymentMethods({ isActive: true });
  const { data: departmentsData } = useDepartments();
  const { data: officesData } = useOffices();
  const { data: disbursementTypesData } = useDisbursementTypes();
  const { data: beneficiariesData } = useBeneficiaries();
  const paymentMethods = paymentMethodsData?.data ?? [];
  const departments = departmentsData?.data ?? [];
  const offices = officesData?.data ?? [];
  const disbursementTypes = disbursementTypesData?.data ?? [];
  const beneficiaries = beneficiariesData?.data ?? [];

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
  const openDetails = (disbursement: any) => {
    setSelectedDisbursement(disbursement);
    setIsSheetOpen(true);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const response = await axiosClient.get('/disbursements/export', {
      params: {
        format,
        search: exportFilters.search || undefined,
        status: exportFilters.status.length ? exportFilters.status.join(',') : undefined,
        paymentMethod: exportFilters.paymentMethod.length ? exportFilters.paymentMethod.join(',') : undefined,
        department: exportFilters.department.length ? exportFilters.department.join(',') : undefined,
        office: exportFilters.office.length ? exportFilters.office.join(',') : undefined,
        beneficiary: exportFilters.beneficiary.length ? exportFilters.beneficiary.join(',') : undefined,
        disbursementType: exportFilters.disbursementType.length ? exportFilters.disbursementType.join(',') : undefined,
        priority: exportFilters.priority.length ? exportFilters.priority.join(',') : undefined,
        isUrgent: exportFilters.isUrgent !== 'all' ? exportFilters.isUrgent : undefined,
        isRetroactive: exportFilters.isRetroactive !== 'all' ? exportFilters.isRetroactive : undefined,
        isCompleted: exportFilters.isCompleted !== 'all' ? exportFilters.isCompleted : undefined,
        minAmount: exportFilters.minAmount || undefined,
        maxAmount: exportFilters.maxAmount || undefined,
        startDate: exportFilters.startDate || undefined,
        endDate: exportFilters.endDate || undefined,
        tags: exportFilters.tags.length ? exportFilters.tags.join(',') : undefined,
        sortBy: exportFilters.sortBy,
        sortOrder: exportFilters.sortOrder,
      },
      responseType: 'blob',
    });
    const mime =
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
    const blob = new Blob([response.data], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disbursements-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const openExportModal = (format: 'csv' | 'xlsx') => {
    setExportFormat(format);
    setExportFilters((prev) => ({
      ...prev,
      search: searchTerm,
      status: filterStatus !== 'all' ? [filterStatus] : [],
      paymentMethod: filterPaymentMethod !== 'all' ? [filterPaymentMethod] : [],
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    }));
    setIsExportOpen(true);
  };

  const handleConfirmExport = async () => {
    await handleExport(exportFormat);
    setIsExportOpen(false);
  };

  const handleMultiSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, field: keyof typeof exportFilters) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setExportFilters((prev) => ({ ...prev, [field]: values }));
  };

  const addTag = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setExportFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(normalized) ? prev.tags : [...prev.tags, normalized],
    }));
  };

  const removeTag = (value: string) => {
    setExportFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== value),
    }));
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (tagInput) {
        addTag(tagInput);
        setTagInput('');
      }
    } else if (event.key === 'Backspace' && !tagInput) {
      const lastTag = exportFilters.tags[exportFilters.tags.length - 1];
      if (lastTag) {
        removeTag(lastTag);
      }
    }
  };

  const clearMultiSelect = (field: keyof typeof exportFilters) => {
    setExportFilters((prev) => ({ ...prev, [field]: [] }));
  };

  const selectAll = (field: keyof typeof exportFilters, values: string[]) => {
    setExportFilters((prev) => ({ ...prev, [field]: values }));
  };

  const toggleSort = (column: 'createdAt' | 'amount' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openExportModal('csv')}>
            {t('disbursements.exportCsv', { defaultValue: 'Export CSV' })}
          </Button>
          <Button variant="outline" onClick={() => openExportModal('xlsx')}>
            {t('disbursements.exportXlsx', { defaultValue: 'Export XLSX' })}
          </Button>
          <Button onClick={() => router.push('/disbursements/new')} className="btn-3d gradient-bg-primary text-white">
            + {t('disbursements.newRequest')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
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
          <select
            value={filterPaymentMethod}
            onChange={(e) => {
              setFilterPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          >
            <option value="all">{t('disbursements.paymentMethod', { defaultValue: 'Payment Method' })}</option>
            {paymentMethods.map((method: any) => (
              <option key={method.code} value={method.code}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="number"
            placeholder={t('disbursements.filters.minAmount', { defaultValue: 'Min amount' })}
            value={minAmount}
            onChange={(e) => {
              setMinAmount(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          />
          <input
            type="number"
            placeholder={t('disbursements.filters.maxAmount', { defaultValue: 'Max amount' })}
            value={maxAmount}
            onChange={(e) => {
              setMaxAmount(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          />
        </div>
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
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.description')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('disbursements.beneficiary')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    <button type="button" onClick={() => toggleSort('amount')} className="inline-flex items-center gap-1">
                      {t('common.amount')}
                      <span className="text-xs text-muted-foreground">{sortBy === 'amount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">{t('common.type')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1">
                      {t('common.status')}
                      <span className="text-xs text-muted-foreground">{sortBy === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    <button type="button" onClick={() => toggleSort('createdAt')} className="inline-flex items-center gap-1">
                      {t('common.created')}
                      <span className="text-xs text-muted-foreground">{sortBy === 'createdAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disbursements.map((disbursement) => (
                  <tr key={disbursement.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">
                      <button
                        type="button"
                        className="text-left font-semibold text-foreground hover:text-primary"
                        onClick={() => openDetails(disbursement)}
                      >
                        {disbursement.description || 'No description'}
                      </button>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t('disbursements.requestNumber', { id: disbursement.referenceNumber || disbursement.id })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {disbursement.beneficiary?.name || disbursement.beneficiary?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {formatPrice(disbursement.amount || 0, disbursement.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {disbursement.disbursementType?.name || 'N/A'}
                      {disbursement.paymentMethod && (
                        <div className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {disbursement.paymentMethod}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={disbursement.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(disbursement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(disbursement.attachments?.length || disbursement.invoices?.length) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(disbursement)}
                          >
                            {t('common.files', { defaultValue: 'Files' })}
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/disbursements/${disbursement._id}`)}
                        >
                          {t('common.view')}
                        </Button>
                      </div>
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

      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        position="right"
        size="lg"
        closeOnOverlayClick
      >
        <SheetHeader>
          <SheetTitle>
            {selectedDisbursement?.description || t('disbursements.details', { defaultValue: 'Disbursement Details' })}
          </SheetTitle>
          <SheetDescription>
            {selectedDisbursement?.referenceNumber || selectedDisbursement?.id || '—'}
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {selectedDisbursement ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.totalAmount')}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {formatPrice(selectedDisbursement.amount || 0, selectedDisbursement.currency)}
                </p>
                <div className="mt-3">
                  <StatusBadge status={selectedDisbursement.status} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.beneficiary')}</p>
                  <p className="mt-2 font-medium text-foreground">
                    {selectedDisbursement.beneficiary?.name || selectedDisbursement.beneficiary?.email || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.type')}</p>
                  <p className="mt-2 font-medium text-foreground">
                    {selectedDisbursement.disbursementType?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.department')}</p>
                  <p className="mt-2 font-medium text-foreground">
                    {selectedDisbursement.department?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.office')}</p>
                  <p className="mt-2 font-medium text-foreground">
                    {selectedDisbursement.office?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.paymentMethod')}</p>
                  <p className="mt-2 font-medium text-foreground">
                    {selectedDisbursement.paymentMethod || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.priorityLabel', { defaultValue: 'Priority' })}</p>
                  <p className="mt-2 font-medium text-foreground">
                    {selectedDisbursement.priority || '—'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('common.description')}</p>
                <p className="mt-2 text-foreground">{selectedDisbursement.description || '—'}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.attachments')}</p>
                {selectedDisbursement.attachments?.length ? (
                  <div className="mt-2 space-y-2">
                    {selectedDisbursement.attachments.map((url: string, idx: number) => (
                      <a
                        key={`${url}-${idx}`}
                        href={url}
                        className="block rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('common.attachment', { defaultValue: 'Attachment' })} {idx + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t('disbursements.noAttachments')}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('disbursements.invoices', { defaultValue: 'Invoices' })}</p>
                {selectedDisbursement.invoices?.length ? (
                  <div className="mt-2 space-y-2">
                    {selectedDisbursement.invoices.map((url: string, idx: number) => (
                      <a
                        key={`${url}-${idx}`}
                        href={url}
                        className="block rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('disbursements.invoice', { defaultValue: 'Invoice' })} {idx + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t('disbursements.noInvoices', { defaultValue: 'No invoices yet.' })}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
          )}
        </SheetBody>
        <SheetFooter className="flex items-center justify-end gap-2 border-t border-border">
          <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
            {t('common.close', { defaultValue: 'Close' })}
          </Button>
          {selectedDisbursement?.id && (
            <Button onClick={() => router.push(`/disbursements/${selectedDisbursement.id}`)}>
              {t('common.view')}
            </Button>
          )}
        </SheetFooter>
      </Sheet>

      <Modal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} size="xl">
        <ModalHeader>
          <ModalTitle>
            {t('disbursements.exportTitle', { defaultValue: 'Export Disbursements' })}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.searchPlaceholder')}
                </label>
                <input
                  type="text"
                  value={exportFilters.search}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.tags', { defaultValue: 'Tags' })}
                </label>
                <div className="mt-1 flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2">
                  {exportFilters.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-foreground">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={t('disbursements.tagsHelp', { defaultValue: 'Type and press Enter' })}
                    className="flex-1 min-w-[140px] bg-transparent text-sm text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.statusLabel', { defaultValue: 'Status' })}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('status', ['draft', 'pending_dept_head', 'pending_validator', 'pending_cashier', 'completed', 'rejected', 'cancelled'])}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('status')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.status}
                  onChange={(e) => handleMultiSelectChange(e, 'status')}
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="draft">{t('disbursements.status.draft')}</option>
                  <option value="pending_dept_head">{t('disbursements.status.pending_dept_head')}</option>
                  <option value="pending_validator">{t('disbursements.status.pending_validator')}</option>
                  <option value="pending_cashier">{t('disbursements.status.pending_cashier')}</option>
                  <option value="completed">{t('disbursements.status.completed')}</option>
                  <option value="rejected">{t('disbursements.status.rejected')}</option>
                  <option value="cancelled">{t('disbursements.status.cancelled')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.paymentMethod', { defaultValue: 'Payment Method' })}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('paymentMethod', paymentMethods.map((method: any) => method.code))}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('paymentMethod')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.paymentMethod}
                  onChange={(e) => handleMultiSelectChange(e, 'paymentMethod')}
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  {paymentMethods.map((method: any) => (
                    <option key={method.code} value={method.code}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.type', { defaultValue: 'Disbursement Type' })}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('disbursementType', disbursementTypes.map((type: any) => type._id || type.id))}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('disbursementType')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.disbursementType}
                  onChange={(e) => handleMultiSelectChange(e, 'disbursementType')}
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  {disbursementTypes.map((type: any) => (
                    <option key={type._id || type.id} value={type._id || type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.beneficiary', { defaultValue: 'Beneficiary' })}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('beneficiary', beneficiaries.map((beneficiary: any) => beneficiary._id || beneficiary.id))}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('beneficiary')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.beneficiary}
                  onChange={(e) => handleMultiSelectChange(e, 'beneficiary')}
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  {beneficiaries.map((beneficiary: any) => (
                    <option key={beneficiary._id || beneficiary.id} value={beneficiary._id || beneficiary.id}>
                      {beneficiary.name || beneficiary.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.department')}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('department', departments.map((department: any) => department._id || department.id))}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('department')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.department}
                  onChange={(e) => handleMultiSelectChange(e, 'department')}
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  {departments.map((department: any) => (
                    <option key={department._id || department.id} value={department._id || department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.office')}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('office', offices.map((office: any) => office._id || office.id))}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('office')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.office}
                  onChange={(e) => handleMultiSelectChange(e, 'office')}
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  {offices.map((office: any) => (
                    <option key={office._id || office.id} value={office._id || office.id}>
                      {office.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.priorityLabel', { defaultValue: 'Priority' })}
                </label>
                <div className="mt-1 flex justify-end gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => selectAll('priority', ['low', 'medium', 'high', 'urgent'])}>
                    {t('common.selectAll', { defaultValue: 'Select all' })}
                  </button>
                  <button type="button" onClick={() => clearMultiSelect('priority')}>
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
                <select
                  multiple
                  value={exportFilters.priority}
                  onChange={(e) => handleMultiSelectChange(e, 'priority')}
                  className="mt-1 h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="low">{t('disbursements.priority.low')}</option>
                  <option value="medium">{t('disbursements.priority.medium')}</option>
                  <option value="high">{t('disbursements.priority.high')}</option>
                  <option value="urgent">{t('disbursements.priority.urgent')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.isUrgent', { defaultValue: 'Urgent' })}
                </label>
                <select
                  value={exportFilters.isUrgent}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, isUrgent: e.target.value as 'all' | 'true' | 'false' }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="all">{t('common.all', { defaultValue: 'All' })}</option>
                  <option value="true">{t('common.yes', { defaultValue: 'Yes' })}</option>
                  <option value="false">{t('common.no', { defaultValue: 'No' })}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.isRetroactive', { defaultValue: 'Retroactive' })}
                </label>
                <select
                  value={exportFilters.isRetroactive}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, isRetroactive: e.target.value as 'all' | 'true' | 'false' }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="all">{t('common.all', { defaultValue: 'All' })}</option>
                  <option value="true">{t('common.yes', { defaultValue: 'Yes' })}</option>
                  <option value="false">{t('common.no', { defaultValue: 'No' })}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.isCompleted', { defaultValue: 'Completed' })}
                </label>
                <select
                  value={exportFilters.isCompleted}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, isCompleted: e.target.value as 'all' | 'true' | 'false' }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="all">{t('common.all', { defaultValue: 'All' })}</option>
                  <option value="true">{t('common.yes', { defaultValue: 'Yes' })}</option>
                  <option value="false">{t('common.no', { defaultValue: 'No' })}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.filters.minAmount', { defaultValue: 'Min amount' })}
                </label>
                <input
                  type="number"
                  value={exportFilters.minAmount}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.filters.maxAmount', { defaultValue: 'Max amount' })}
                </label>
                <input
                  type="number"
                  value={exportFilters.maxAmount}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.filters.startDate', { defaultValue: 'Start date' })}
                </label>
                <input
                  type="date"
                  value={exportFilters.startDate}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.filters.endDate', { defaultValue: 'End date' })}
                </label>
                <input
                  type="date"
                  value={exportFilters.endDate}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.sortBy', { defaultValue: 'Sort by' })}
                </label>
                <select
                  value={exportFilters.sortBy}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="createdAt">{t('common.created')}</option>
                  <option value="amount">{t('common.amount')}</option>
                  <option value="status">{t('common.status')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t('disbursements.sortOrder', { defaultValue: 'Sort order' })}
                </label>
                <select
                  value={exportFilters.sortOrder}
                  onChange={(e) => setExportFilters((prev) => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="desc">{t('common.desc', { defaultValue: 'Descending' })}</option>
                  <option value="asc">{t('common.asc', { defaultValue: 'Ascending' })}</option>
                </select>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-2 border-t border-border">
          <Button variant="outline" onClick={() => setIsExportOpen(false)}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleConfirmExport}>
            {exportFormat === 'xlsx'
              ? t('disbursements.exportXlsx', { defaultValue: 'Export XLSX' })
              : t('disbursements.exportCsv', { defaultValue: 'Export CSV' })}
          </Button>
        </ModalFooter>
      </Modal>
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
