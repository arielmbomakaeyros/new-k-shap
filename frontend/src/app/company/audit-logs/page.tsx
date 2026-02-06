'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { auditLogsService } from '@/src/services/audit-logs.service';
import { queryKeys } from '@/src/hooks/queries/keys';

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>({});

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auditLogs.list({ page, limit: 20, ...filters }),
    queryFn: () => auditLogsService.findAll({ page, limit: 20, ...filters }),
  });

  const logs = (data as any)?.data?.data || (data as any)?.data || [];
  const pagination = (data as any)?.data?.pagination || (data as any)?.pagination || {};

  return (
    <ProtectedLayout title={t('navigation.auditLogs')}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder={t('common.search')}
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
          />
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={filters.action || ''}
            onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
          >
            <option value="">{t('common.allActions')}</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="custom">Custom</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>

          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={filters.resourceType || ''}
            onChange={(e) => setFilters({ ...filters, resourceType: e.target.value || undefined })}
          >
            <option value="">{t('common.allResources')}</option>
            <option value="disbursements">Disbursements</option>
            <option value="collections">Collections</option>
            <option value="users">Users</option>
            <option value="companies">Companies</option>
            <option value="departments">Departments</option>
            <option value="offices">Offices</option>
            <option value="settings">Settings</option>
          </select>

          <input
            type="date"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
          />
          <input
            type="date"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('common.timestamp')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('common.user')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('common.action')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('common.resource')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('common.details')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('common.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log._id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {log.userName || log.user?.firstName || log.user?.email || log.userEmail || log.userId || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.userRole ? log.userRole.replace(/_/g, ' ') : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {log.action}
                      </span>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {log.actionDescription || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{log.resourceType || '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.resourceName || log.resourceId || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs">
                      <div className="truncate">{log.endpoint || '—'}</div>
                      <div className="mt-1 truncate">{log.ipAddress || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                        log.status === 'failure' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {log.status || 'success'}
                      </span>
                      {log.severity && (
                        <div className="mt-1 text-muted-foreground">{log.severity}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('common.page')} {page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                {t('common.previous')}
              </button>
              <button
                className="px-3 py-1 text-sm rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
