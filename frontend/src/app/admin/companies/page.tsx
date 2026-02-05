'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/src/types';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useTranslation } from '@/node_modules/react-i18next';
import {
  useKaeyrosCompanies,
  useCreateKaeyrosCompany,
  useUpdateKaeyrosCompany,
  useUpdateKaeyrosCompanyStatus,
  useResendKaeyrosCompanyActivation,
  useDeleteKaeyrosCompany,
} from '@/src/hooks/queries';
import type { Company } from '@/src/services';

function CompaniesManagerContent() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activationToasts, setActivationToasts] = useState<
    { id: string; title: string; description?: string; variant?: 'success' | 'error' }[]
  >([]);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    industry: '',
    website: '',
    status: 'active' as SubscriptionStatus,
    plan: 'professional',
    maxUsers: '',
    trialEndsAt: '',
    defaultCurrency: 'XAF',
    paymentMethods: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'] as string[],
    timezone: 'Africa/Douala',
    supportedLanguages: ['fr', 'en'] as string[],
    defaultLanguage: 'fr',
    logoUrl: '',
    primaryColor: '#1d4ed8',
    notificationChannels: {
      email: true,
      sms: false,
      whatsapp: false,
      inApp: true,
    },
    emailNotificationSettings: {
      onNewDisbursement: true,
      onDisbursementApproved: true,
      onDisbursementRejected: true,
      onCollectionAdded: true,
      dailySummary: false,
    },
    workflowSettings: {
      requireDeptHeadApproval: true,
      requireValidatorApproval: true,
      requireCashierExecution: true,
      maxAmountNoApproval: 500000,
    },
    payoutSchedule: {
      frequency: 'monthly',
      dayOfMonth: 25,
      dayOfWeek: 'friday',
    },
    features: {
      disbursements: true,
      collections: true,
      chat: true,
      notifications: true,
      emailNotifications: true,
      reports: true,
      multiCurrency: false,
      apiAccess: true,
    },
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
  });

  // Fetch companies from API
  const { data: companiesData, isLoading, error } = useKaeyrosCompanies({
    search: searchTerm || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

  // Mutations
  const createMutation = useCreateKaeyrosCompany();
  const deleteMutation = useDeleteKaeyrosCompany();
  const updateMutation = useUpdateKaeyrosCompany();
  const updateStatusMutation = useUpdateKaeyrosCompanyStatus();
  const resendActivationMutation = useResendKaeyrosCompanyActivation();

  const allowedStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.Active,
    SubscriptionStatus.Suspended,
    SubscriptionStatus.Trial,
    SubscriptionStatus.Expired,
    SubscriptionStatus.Deleted,
  ];

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const getCreateErrors = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Company name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Company email is required.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Company email must be valid.';
    }
    if (!formData.adminFirstName.trim()) errors.adminFirstName = 'Admin first name is required.';
    if (!formData.adminLastName.trim()) errors.adminLastName = 'Admin last name is required.';
    if (!formData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required.';
    } else if (!isValidEmail(formData.adminEmail)) {
      errors.adminEmail = 'Admin email must be valid.';
    }

    if (formData.status && !allowedStatuses.includes(formData.status)) {
      errors.status = 'Status is invalid.';
    }

    if (formData.maxUsers && Number.isNaN(Number(formData.maxUsers))) {
      errors.maxUsers = 'Max users must be a number.';
    }

    if (formData.trialEndsAt) {
      const dateValue = new Date(formData.trialEndsAt);
      if (Number.isNaN(dateValue.getTime())) {
        errors.trialEndsAt = 'Trial end date must be valid.';
      }
    }

    return errors;
  };

  const createErrors = getCreateErrors();
  const canCreate = Object.keys(createErrors).length === 0;

  const getEditErrors = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Company name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Company email is required.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Company email must be valid.';
    }

    if (formData.status && !allowedStatuses.includes(formData.status)) {
      errors.status = 'Status is invalid.';
    }

    if (formData.maxUsers && Number.isNaN(Number(formData.maxUsers))) {
      errors.maxUsers = 'Max users must be a number.';
    }

    if (formData.trialEndsAt) {
      const dateValue = new Date(formData.trialEndsAt);
      if (Number.isNaN(dateValue.getTime())) {
        errors.trialEndsAt = 'Trial end date must be valid.';
      }
    }

    return errors;
  };

  const editErrors = getEditErrors();
  const canUpdate = Object.keys(editErrors).length === 0;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      industry: '',
      website: '',
      status: 'active',
      plan: 'professional',
      maxUsers: '',
      trialEndsAt: '',
      defaultCurrency: 'XAF',
      paymentMethods: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'] as string[],
      timezone: 'Africa/Douala',
      supportedLanguages: ['fr', 'en'] as string[],
      defaultLanguage: 'fr',
      logoUrl: '',
      primaryColor: '#1d4ed8',
      notificationChannels: {
        email: true,
        sms: false,
        whatsapp: false,
        inApp: true,
      },
      emailNotificationSettings: {
        onNewDisbursement: true,
        onDisbursementApproved: true,
        onDisbursementRejected: true,
        onCollectionAdded: true,
        dailySummary: false,
      },
      workflowSettings: {
        requireDeptHeadApproval: true,
        requireValidatorApproval: true,
        requireCashierExecution: true,
        maxAmountNoApproval: 500000,
      },
      payoutSchedule: {
        frequency: 'monthly',
        dayOfMonth: 25,
        dayOfWeek: 'friday',
      },
      features: {
        disbursements: true,
        collections: true,
        chat: true,
        notifications: true,
        emailNotifications: true,
        reports: true,
        multiCurrency: false,
        apiAccess: true,
      },
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
    });
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        status: formData.status,
        plan: formData.plan,
        maxUsers: formData.maxUsers ? Number(formData.maxUsers) : undefined,
        trialEndsAt: formData.trialEndsAt || undefined,
        defaultCurrency: formData.defaultCurrency,
        paymentMethods: formData.paymentMethods,
        timezone: formData.timezone,
        supportedLanguages: formData.supportedLanguages,
        defaultLanguage: formData.defaultLanguage,
        logoUrl: formData.logoUrl || undefined,
        primaryColor: formData.primaryColor || undefined,
        notificationChannels: formData.notificationChannels,
        emailNotificationSettings: formData.emailNotificationSettings,
        workflowSettings: formData.workflowSettings,
        payoutSchedule: formData.payoutSchedule,
        features: formData.features,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
      });
      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      city: company.city || '',
      country: company.country || '',
      industry: company.industry || '',
      website: (company as any).website || '',
      status: (company as any).status || (company as any).subscriptionStatus || 'active',
      plan: (company as any).planType || 'professional',
      maxUsers: String((company as any).maxUsers || ''),
      trialEndsAt: (company as any).trialEndDate
        ? new Date((company as any).trialEndDate).toISOString().slice(0, 10)
        : '',
      defaultCurrency: (company as any).defaultCurrency || 'XAF',
      paymentMethods: (company as any).paymentMethods || ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
      timezone: (company as any).timezone || 'Africa/Douala',
      supportedLanguages: (company as any).supportedLanguages || ['fr', 'en'],
      defaultLanguage: (company as any).defaultLanguage || 'fr',
      logoUrl: (company as any).logoUrl || '',
      primaryColor: (company as any).primaryColor || '#1d4ed8',
      notificationChannels: (company as any).notificationChannels || {
        email: true,
        sms: false,
        whatsapp: false,
        inApp: true,
      },
      emailNotificationSettings: (company as any).emailNotificationSettings || {
        onNewDisbursement: true,
        onDisbursementApproved: true,
        onDisbursementRejected: true,
        onCollectionAdded: true,
        dailySummary: false,
      },
      workflowSettings: (company as any).workflowSettings || {
        requireDeptHeadApproval: true,
        requireValidatorApproval: true,
        requireCashierExecution: true,
        maxAmountNoApproval: 500000,
      },
      payoutSchedule: (company as any).payoutSchedule || {
        frequency: 'monthly',
        dayOfMonth: 25,
        dayOfWeek: 'friday',
      },
      features: (company as any).enabledFeatures || {
        disbursements: true,
        collections: true,
        chat: true,
        notifications: true,
        emailNotifications: true,
        reports: true,
        multiCurrency: false,
        apiAccess: true,
      },
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedCompany || !formData.name || !formData.email) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedCompany.id,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
          website: formData.website || undefined,
          status: formData.status,
          planType: formData.plan,
          maxUsers: formData.maxUsers ? Number(formData.maxUsers) : undefined,
          trialEndsAt: formData.trialEndsAt || undefined,
          defaultCurrency: formData.defaultCurrency,
          paymentMethods: formData.paymentMethods,
          timezone: formData.timezone,
          supportedLanguages: formData.supportedLanguages,
          defaultLanguage: formData.defaultLanguage,
          logoUrl: formData.logoUrl || undefined,
          primaryColor: formData.primaryColor || undefined,
          notificationChannels: formData.notificationChannels,
          emailNotificationSettings: formData.emailNotificationSettings,
          workflowSettings: formData.workflowSettings,
          payoutSchedule: formData.payoutSchedule,
          features: formData.features,
        },
      });
      resetForm();
      setSelectedCompany(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const addActivationToast = (toast: { title: string; description?: string; variant?: 'success' | 'error' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setActivationToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setActivationToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const handleResendActivation = async (company: Company) => {
    const companyId = company.id || (company as any)._id;
    if (!companyId) {
      addActivationToast({
        title: t('companies.activationFailedTitle', { defaultValue: 'Activation Email Failed' }),
        description: t('companies.activationFailedBody', {
          defaultValue: 'Failed to send activation email for {{name}}.',
          name: company.name,
        }),
        variant: 'error',
      });
      return;
    }
    try {
      await resendActivationMutation.mutateAsync(companyId);
      addActivationToast({
        title: t('companies.activationSentTitle', { defaultValue: 'Activation Email Sent' }),
        description: t('companies.activationSentBody', {
          defaultValue: 'Activation email sent to {{name}}.',
          name: company.name,
        }),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to resend activation email:', error);
      addActivationToast({
        title: t('companies.activationFailedTitle', { defaultValue: 'Activation Email Failed' }),
        description: t('companies.activationFailedBody', {
          defaultValue: 'Failed to send activation email for {{name}}.',
          name: company.name,
        }),
        variant: 'error',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCompany) return;
    try {
      await deleteMutation.mutateAsync(selectedCompany.id);
      setSelectedCompany(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  const handleToggleSubscription = async (id: string, status: SubscriptionStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('companies.loading', { defaultValue: 'Loading companies...' })}</span>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('companies.loadFailed', { defaultValue: 'Failed to load companies. Please try again.' })}</p>
        </div>
      </AdminLayout>
    );
  }

  const companies = Array.isArray(companiesData?.data)
    ? companiesData.data
    : Array.isArray((companiesData as any)?.data?.data)
      ? (companiesData as any).data.data
      : [];

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const companyStatus = (company as any).status || (company as any).subscriptionStatus;
    const matchesStatus = filterStatus === 'all' || companyStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'trial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'deleted':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('companies.title', { defaultValue: 'Companies' })}</h1>
            <p className="mt-2 text-muted-foreground">{t('companies.subtitle', { defaultValue: 'Manage all subscribed companies' })}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>{t('companies.create', { defaultValue: '+ Create Company' })}</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder={t('companies.search', { defaultValue: 'Search companies...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SubscriptionStatus | 'all')}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">{t('companies.status.all', { defaultValue: 'All Statuses' })}</option>
            <option value="active">{t('companies.status.active', { defaultValue: 'Active' })}</option>
            <option value="suspended">{t('companies.status.suspended', { defaultValue: 'Suspended' })}</option>
            <option value="trial">{t('companies.status.trial', { defaultValue: 'Trial' })}</option>
            <option value="expired">{t('companies.status.expired', { defaultValue: 'Expired' })}</option>
            <option value="deleted">{t('companies.status.deleted', { defaultValue: 'Deleted' })}</option>
          </select>
        </div>

        {activationToasts.length > 0 && (
          <div className="fixed right-6 top-6 z-50 flex w-80 flex-col gap-3">
            {activationToasts.map((toast) => (
              <div
                key={toast.id}
                className={`rounded-lg border px-4 py-3 shadow-lg ${
                  toast.variant === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-green-200 bg-green-50 text-green-800'
                }`}
              >
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.description && <div className="mt-1 text-xs">{toast.description}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {t('companies.showing', { defaultValue: 'Showing {{count}} of {{total}} companies', count: filteredCompanies.length, total: companies.length })}
        </div>

        {/* Empty State */}
        {companies.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">{t('companies.empty', { defaultValue: 'No companies found. Create your first company.' })}</p>
          </div>
        )}

        {/* Table */}
        {companies.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('companies.company', { defaultValue: 'Company' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('companies.email', { defaultValue: 'Email' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('companies.status', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('companies.industry', { defaultValue: 'Industry' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('companies.created', { defaultValue: 'Created' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.actions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCompanies.map((company, index) => (
                  <tr key={company.id || index} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{company.name}</td>
                    <td className="px-4 py-3 text-sm">{company.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={(company as any).status || (company as any).subscriptionStatus || 'trial'}
                        onChange={(e) =>
                          handleToggleSubscription(company.id, e.target.value as SubscriptionStatus)
                        }
                        className={`rounded px-2 py-1 text-xs font-semibold ${getStatusColor(
                          ((company as any).status || (company as any).subscriptionStatus) as string
                        )}`}
                      >
                        <option value="active">{t('companies.status.active', { defaultValue: 'Active' })}</option>
                        <option value="suspended">{t('companies.status.suspended', { defaultValue: 'Suspended' })}</option>
                        <option value="trial">{t('companies.status.trial', { defaultValue: 'Trial' })}</option>
                        <option value="expired">{t('companies.status.expired', { defaultValue: 'Expired' })}</option>
                        <option value="deleted">{t('companies.status.deleted', { defaultValue: 'Deleted' })}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">{company.industry || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(company)}
                        >
                          {t('common.edit', { defaultValue: 'Edit' })}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendActivation(company)}
                          disabled={resendActivationMutation.isPending}
                        >
                          {t('companies.sendActivation', { defaultValue: 'Send Activation' })}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(company)}
                        >
                          {t('common.delete', { defaultValue: 'Delete' })}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">{t('companies.createTitle', { defaultValue: 'Create New Company' })}</h2>
            <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.name', { defaultValue: 'Company Name *' })}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder={t('companies.placeholders.name', { defaultValue: 'Enter company name' })}
                />
                {createErrors.name && <p className="mt-1 text-xs text-destructive">{createErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.email', { defaultValue: 'Email *' })}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder="contact@company.com"
                />
                {createErrors.email && <p className="mt-1 text-xs text-destructive">{createErrors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.adminFirstName', { defaultValue: 'Admin First Name *' })}</label>
                  <input
                    type="text"
                    value={formData.adminFirstName}
                    onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder={t('companies.placeholders.adminFirstName', { defaultValue: 'John' })}
                  />
                  {createErrors.adminFirstName && <p className="mt-1 text-xs text-destructive">{createErrors.adminFirstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.adminLastName', { defaultValue: 'Admin Last Name *' })}</label>
                  <input
                    type="text"
                    value={formData.adminLastName}
                    onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder={t('companies.placeholders.adminLastName', { defaultValue: 'Doe' })}
                  />
                  {createErrors.adminLastName && <p className="mt-1 text-xs text-destructive">{createErrors.adminLastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.adminEmail', { defaultValue: 'Admin Email *' })}</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder="admin@company.com"
                />
                {createErrors.adminEmail && <p className="mt-1 text-xs text-destructive">{createErrors.adminEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.phone', { defaultValue: 'Phone' })}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder="+237 6xx xxx xxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.website', { defaultValue: 'Website' })}</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder="https://company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.city', { defaultValue: 'City' })}</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.country', { defaultValue: 'Country' })}</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.industry', { defaultValue: 'Industry' })}</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder={t('companies.placeholders.industry', { defaultValue: 'e.g., Technology, Finance' })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.defaultCurrency', { defaultValue: 'Default Currency' })}</label>
                  <input
                    type="text"
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="XAF"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.defaultLanguage', { defaultValue: 'Default Language' })}</label>
                  <select
                    value={formData.defaultLanguage}
                    onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="fr">French</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.supportedLanguages', { defaultValue: 'Supported Languages' })}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['fr', 'en'].map((lang) => (
                    <label key={lang} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.supportedLanguages.includes(lang)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.supportedLanguages, lang]
                            : formData.supportedLanguages.filter((l) => l !== lang);
                          setFormData({ ...formData, supportedLanguages: next });
                        }}
                        className="rounded border-input"
                      />
                      <span className="uppercase">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.paymentMethods', { defaultValue: 'Payment Methods' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['cash', 'bank_transfer', 'mobile_money', 'check', 'card'].map((method) => (
                    <label key={method} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.includes(method)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.paymentMethods, method]
                            : formData.paymentMethods.filter((m) => m !== method);
                          setFormData({ ...formData, paymentMethods: next });
                        }}
                        className="rounded border-input"
                      />
                      <span className="capitalize">{method.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.timezone', { defaultValue: 'Timezone' })}</label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Africa/Douala"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.primaryColor', { defaultValue: 'Primary Color' })}</label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.logoUrl', { defaultValue: 'Logo URL' })}</label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.notificationChannels', { defaultValue: 'Notification Channels' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(formData.notificationChannels).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notificationChannels: { ...formData.notificationChannels, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-input"
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.emailNotifications', { defaultValue: 'Email Notifications' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(formData.emailNotificationSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emailNotificationSettings: { ...formData.emailNotificationSettings, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-input"
                      />
                      <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.workflow', { defaultValue: 'Workflow Settings' })}</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.workflowSettings.requireDeptHeadApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: { ...formData.workflowSettings, requireDeptHeadApproval: e.target.checked },
                        })
                      }
                      className="rounded border-input"
                    />
                    <span>Require Dept Head Approval</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.workflowSettings.requireValidatorApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: { ...formData.workflowSettings, requireValidatorApproval: e.target.checked },
                        })
                      }
                      className="rounded border-input"
                    />
                    <span>Require Validator Approval</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.workflowSettings.requireCashierExecution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: { ...formData.workflowSettings, requireCashierExecution: e.target.checked },
                        })
                      }
                      className="rounded border-input"
                    />
                    <span>Require Cashier Execution</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Max Amount No Approval</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.workflowSettings.maxAmountNoApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: {
                            ...formData.workflowSettings,
                            maxAmountNoApproval: Number(e.target.value),
                          },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.payoutSchedule', { defaultValue: 'Payout Schedule' })}</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    value={formData.payoutSchedule.frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutSchedule: { ...formData.payoutSchedule, frequency: e.target.value },
                      })
                    }
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.payoutSchedule.dayOfMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutSchedule: { ...formData.payoutSchedule, dayOfMonth: Number(e.target.value) },
                      })
                    }
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Day"
                  />
                  <input
                    type="text"
                    value={formData.payoutSchedule.dayOfWeek}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutSchedule: { ...formData.payoutSchedule, dayOfWeek: e.target.value },
                      })
                    }
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Day of week"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.status', { defaultValue: 'Status' })}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SubscriptionStatus })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="active">{t('companies.status.active', { defaultValue: 'Active' })}</option>
                    <option value="suspended">{t('companies.status.suspended', { defaultValue: 'Suspended' })}</option>
                    <option value="trial">{t('companies.status.trial', { defaultValue: 'Trial' })}</option>
                    <option value="expired">{t('companies.status.expired', { defaultValue: 'Expired' })}</option>
                    <option value="deleted">{t('companies.status.deleted', { defaultValue: 'Deleted' })}</option>
                  </select>
                  {createErrors.status && <p className="mt-1 text-xs text-destructive">{createErrors.status}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.plan', { defaultValue: 'Plan' })}</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.maxUsers', { defaultValue: 'Max Users' })}</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                  {createErrors.maxUsers && <p className="mt-1 text-xs text-destructive">{createErrors.maxUsers}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.trialEndsAt', { defaultValue: 'Trial Ends' })}</label>
                  <input
                    type="date"
                    value={formData.trialEndsAt}
                    onChange={(e) => setFormData({ ...formData, trialEndsAt: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                  {createErrors.trialEndsAt && <p className="mt-1 text-xs text-destructive">{createErrors.trialEndsAt}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.features', { defaultValue: 'Enabled Features' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-input"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !canCreate}
                >
                  {createMutation.isPending ? t('companies.creating', { defaultValue: 'Creating...' }) : t('companies.createAction', { defaultValue: 'Create Company' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">{t('companies.editTitle', { defaultValue: 'Edit Company' })}</h2>
            <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.name', { defaultValue: 'Company Name *' })}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
                {editErrors.name && <p className="mt-1 text-xs text-destructive">{editErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.email', { defaultValue: 'Email *' })}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
                {editErrors.email && <p className="mt-1 text-xs text-destructive">{editErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.phone', { defaultValue: 'Phone' })}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.website', { defaultValue: 'Website' })}</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.city', { defaultValue: 'City' })}</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.country', { defaultValue: 'Country' })}</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.industry', { defaultValue: 'Industry' })}</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.defaultCurrency', { defaultValue: 'Default Currency' })}</label>
                  <input
                    type="text"
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="XAF"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.defaultLanguage', { defaultValue: 'Default Language' })}</label>
                  <select
                    value={formData.defaultLanguage}
                    onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="fr">French</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.supportedLanguages', { defaultValue: 'Supported Languages' })}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['fr', 'en'].map((lang) => (
                    <label key={lang} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.supportedLanguages.includes(lang)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.supportedLanguages, lang]
                            : formData.supportedLanguages.filter((l) => l !== lang);
                          setFormData({ ...formData, supportedLanguages: next });
                        }}
                        className="rounded border-input"
                      />
                      <span className="uppercase">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.paymentMethods', { defaultValue: 'Payment Methods' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['cash', 'bank_transfer', 'mobile_money', 'check', 'card'].map((method) => (
                    <label key={method} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.includes(method)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.paymentMethods, method]
                            : formData.paymentMethods.filter((m) => m !== method);
                          setFormData({ ...formData, paymentMethods: next });
                        }}
                        className="rounded border-input"
                      />
                      <span className="capitalize">{method.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.timezone', { defaultValue: 'Timezone' })}</label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Africa/Douala"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.primaryColor', { defaultValue: 'Primary Color' })}</label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.logoUrl', { defaultValue: 'Logo URL' })}</label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.notificationChannels', { defaultValue: 'Notification Channels' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(formData.notificationChannels).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notificationChannels: { ...formData.notificationChannels, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-input"
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.emailNotifications', { defaultValue: 'Email Notifications' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(formData.emailNotificationSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emailNotificationSettings: { ...formData.emailNotificationSettings, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-input"
                      />
                      <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.workflow', { defaultValue: 'Workflow Settings' })}</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.workflowSettings.requireDeptHeadApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: { ...formData.workflowSettings, requireDeptHeadApproval: e.target.checked },
                        })
                      }
                      className="rounded border-input"
                    />
                    <span>Require Dept Head Approval</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.workflowSettings.requireValidatorApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: { ...formData.workflowSettings, requireValidatorApproval: e.target.checked },
                        })
                      }
                      className="rounded border-input"
                    />
                    <span>Require Validator Approval</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.workflowSettings.requireCashierExecution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: { ...formData.workflowSettings, requireCashierExecution: e.target.checked },
                        })
                      }
                      className="rounded border-input"
                    />
                    <span>Require Cashier Execution</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Max Amount No Approval</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.workflowSettings.maxAmountNoApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workflowSettings: {
                            ...formData.workflowSettings,
                            maxAmountNoApproval: Number(e.target.value),
                          },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.payoutSchedule', { defaultValue: 'Payout Schedule' })}</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    value={formData.payoutSchedule.frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutSchedule: { ...formData.payoutSchedule, frequency: e.target.value },
                      })
                    }
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.payoutSchedule.dayOfMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutSchedule: { ...formData.payoutSchedule, dayOfMonth: Number(e.target.value) },
                      })
                    }
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Day"
                  />
                  <input
                    type="text"
                    value={formData.payoutSchedule.dayOfWeek}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutSchedule: { ...formData.payoutSchedule, dayOfWeek: e.target.value },
                      })
                    }
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Day of week"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.status', { defaultValue: 'Status' })}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SubscriptionStatus })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="active">{t('companies.status.active', { defaultValue: 'Active' })}</option>
                    <option value="suspended">{t('companies.status.suspended', { defaultValue: 'Suspended' })}</option>
                    <option value="trial">{t('companies.status.trial', { defaultValue: 'Trial' })}</option>
                    <option value="expired">{t('companies.status.expired', { defaultValue: 'Expired' })}</option>
                    <option value="deleted">{t('companies.status.deleted', { defaultValue: 'Deleted' })}</option>
                  </select>
                  {editErrors.status && <p className="mt-1 text-xs text-destructive">{editErrors.status}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.plan', { defaultValue: 'Plan' })}</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.maxUsers', { defaultValue: 'Max Users' })}</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                  {editErrors.maxUsers && <p className="mt-1 text-xs text-destructive">{editErrors.maxUsers}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('companies.fields.trialEndsAt', { defaultValue: 'Trial Ends' })}</label>
                  <input
                    type="date"
                    value={formData.trialEndsAt}
                    onChange={(e) => setFormData({ ...formData, trialEndsAt: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                  {editErrors.trialEndsAt && <p className="mt-1 text-xs text-destructive">{editErrors.trialEndsAt}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t('companies.fields.features', { defaultValue: 'Enabled Features' })}</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-input"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setSelectedCompany(null);
                    setShowEditModal(false);
                  }}
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending || !canUpdate}
                >
                  {updateMutation.isPending ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.saveChanges', { defaultValue: 'Save Changes' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">{t('companies.deleteTitle', { defaultValue: 'Delete Company' })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('companies.deleteConfirm', { defaultValue: 'Are you sure you want to delete {{name}}? This action cannot be undone.', name: selectedCompany.name })}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCompany(null);
                  setShowDeleteModal(false);
                }}
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('common.deleting', { defaultValue: 'Deleting...' }) : t('common.delete', { defaultValue: 'Delete' })}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function CompaniesPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <CompaniesManagerContent />
    </ProtectedRoute>
  );
}
