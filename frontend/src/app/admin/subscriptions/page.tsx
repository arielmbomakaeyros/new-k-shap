'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useCompanies, useUpdateCompany } from '@/src/hooks/queries';
import type { Company } from '@/src/services';

function SubscriptionsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'expired'>('all');

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Form state for edit modal
  const [editForm, setEditForm] = useState({
    subscriptionStatus: '' as Company['subscriptionStatus'],
    subscriptionEndDate: '',
  });

  // Renew form state
  const [renewDuration, setRenewDuration] = useState<'30' | '90' | '180' | '365'>('30');

  // Fetch companies from API
  const { data: companiesData, isLoading, error } = useCompanies();

  // Mutations
  const updateMutation = useUpdateCompany();

  const handleEditClick = (company: Company) => {
    setSelectedCompany(company);
    setEditForm({
      subscriptionStatus: company.subscriptionStatus,
      subscriptionEndDate: company.subscriptionEndDate
        ? new Date(company.subscriptionEndDate).toISOString().split('T')[0]
        : '',
    });
    setShowEditModal(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedCompany) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedCompany.id,
        data: {
          subscriptionStatus: editForm.subscriptionStatus,
          subscriptionEndDate: editForm.subscriptionEndDate || undefined,
        },
      });
      setSelectedCompany(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleRenewClick = (company: Company) => {
    setSelectedCompany(company);
    setRenewDuration('30');
    setShowRenewModal(true);
  };

  const handleConfirmRenew = async () => {
    if (!selectedCompany) return;
    try {
      // Calculate new end date based on current date + duration
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + parseInt(renewDuration));

      await updateMutation.mutateAsync({
        id: selectedCompany.id,
        data: {
          subscriptionStatus: 'active',
          subscriptionEndDate: newEndDate.toISOString().split('T')[0],
        },
      });
      setSelectedCompany(null);
      setShowRenewModal(false);
    } catch (error) {
      console.error('Failed to renew subscription:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading subscriptions...</span>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load subscriptions. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  const companies = Array.isArray(companiesData?.data) ? companiesData.data : [];

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.subscriptionStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeSubscriptions = companies.filter((c) => c.subscriptionStatus === 'active').length;
  const expiringSoon = companies.filter((c) => {
    if (c.subscriptionStatus !== 'active' || !c.subscriptionEndDate) return false;
    const daysUntil = Math.ceil((new Date(c.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  }).length;
  const expiredCount = companies.filter((c) => c.subscriptionStatus === 'expired').length;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const daysUntilExpiry = (endDate: string | undefined) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
            <p className="mt-2 text-muted-foreground">Manage company subscriptions and plans</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Companies</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{companies.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{activeSubscriptions}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{expiringSoon}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{expiredCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>

        {/* Empty State */}
        {companies.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">No companies found.</p>
          </div>
        )}

        {/* Subscriptions Table */}
        {companies.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Expires</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCompanies.map((company, index) => {
                  const days = daysUntilExpiry(company.subscriptionEndDate);
                  const status = company.subscriptionStatus || 'inactive';
                  return (
                    <tr key={company.id || index} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{company.name}</td>
                      <td className="px-4 py-3 text-sm">{company.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {company.subscriptionEndDate ? (
                          days !== null && days > 0 ? (
                            <span className={days < 30 ? 'text-yellow-600 font-semibold' : ''}>
                              {days} days
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">Expired</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">No end date</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(company)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenewClick(company)}
                          >
                            Renew
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Edit Subscription</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update subscription for {selectedCompany.name}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  value={editForm.subscriptionStatus}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value as Company['subscriptionStatus'] })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">End Date</label>
                <input
                  type="date"
                  value={editForm.subscriptionEndDate}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionEndDate: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCompany(null);
                  setShowEditModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Subscription Modal */}
      {showRenewModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Renew Subscription</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Extend subscription for {selectedCompany.name}
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground">Duration</label>
              <select
                value={renewDuration}
                onChange={(e) => setRenewDuration(e.target.value as typeof renewDuration)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="30">30 days</option>
                <option value="90">90 days (3 months)</option>
                <option value="180">180 days (6 months)</option>
                <option value="365">365 days (1 year)</option>
              </select>
              <p className="mt-2 text-sm text-muted-foreground">
                New end date will be:{' '}
                <strong>
                  {new Date(Date.now() + parseInt(renewDuration) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </strong>
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCompany(null);
                  setShowRenewModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRenew}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Renewing...' : 'Renew Subscription'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <SubscriptionsContent />
    </ProtectedRoute>
  );
}
