'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import {
  useCompanySettings,
  useUpdateCompanyInfo,
  useUpdateWorkflowSettings,
  useUpdateEmailNotificationSettings,
  // useUpdateCompanyPreferences,
  useRoles,
  useOffices,
  useBeneficiaries,
} from '@/src/hooks/queries';
import { formatPrice } from '@/src/lib/format';
import { useUpdateCompanyPreferences } from '@/src/hooks/queries/useSettings';
import { fileUploadService } from '@/src/services';

type PayoutScheduleState = {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfMonth?: number;
  dayOfWeek?: string;
};

type PreferencesState = {
  defaultCurrency: string;
  paymentMethods: string[];
  branding: {
    logoUrl: string;
    primaryColor: string;
  };
  notificationChannels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  payoutSchedule: PayoutScheduleState;
  approvalLimitsByRole: Record<string, number>;
  officeSpendCaps: Record<string, number>;
  defaultBeneficiaries: string[];
};

export default function CompanySettingsPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading, error } = useCompanySettings();
  const updateCompanyInfo = useUpdateCompanyInfo();
  const updateWorkflowSettings = useUpdateWorkflowSettings();
  const updateEmailNotificationSettings = useUpdateEmailNotificationSettings();
  const updateCompanyPreferences = useUpdateCompanyPreferences();
  const { data: rolesData } = useRoles();
  const { data: officesData } = useOffices();
  const { data: beneficiariesData } = useBeneficiaries();

  // Form state
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    requireDeptHeadApproval: true,
    requireValidatorApproval: true,
    requireCashierExecution: true,
    maxAmountNoApproval: 500000,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    onNewDisbursement: true,
    onDisbursementApproved: true,
    onDisbursementRejected: true,
    onCollectionAdded: true,
    dailySummary: false,
  });

  const [preferences, setPreferences] = useState<PreferencesState>({
    defaultCurrency: 'XAF',
    paymentMethods: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'] as string[],
    branding: {
      logoUrl: '',
      primaryColor: '#1d4ed8',
    },
    notificationChannels: {
      email: true,
      sms: false,
      whatsapp: false,
      inApp: true,
    },
    payoutSchedule: {
      frequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
      dayOfMonth: 25,
      dayOfWeek: 'friday',
    },
    approvalLimitsByRole: {} as Record<string, number>,
    officeSpendCaps: {} as Record<string, number>,
    defaultBeneficiaries: [] as string[],
  });

  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Populate form with fetched data
  useEffect(() => {
    if (settings) {
      setCompanyInfo({
        name: settings.companyInfo?.name || '',
        email: settings.companyInfo?.email || '',
        phone: settings.companyInfo?.phone || '',
        address: settings.companyInfo?.address || '',
        industry: settings.companyInfo?.industry || '',
      });
      setWorkflowSettings({
        requireDeptHeadApproval: settings.workflowSettings?.requireDeptHeadApproval ?? true,
        requireValidatorApproval: settings.workflowSettings?.requireValidatorApproval ?? true,
        requireCashierExecution: settings.workflowSettings?.requireCashierExecution ?? true,
        maxAmountNoApproval: settings.workflowSettings?.maxAmountNoApproval ?? 500000,
      });
      setNotificationSettings({
        onNewDisbursement: settings.emailNotificationSettings?.onNewDisbursement ?? true,
        onDisbursementApproved: settings.emailNotificationSettings?.onDisbursementApproved ?? true,
        onDisbursementRejected: settings.emailNotificationSettings?.onDisbursementRejected ?? true,
        onCollectionAdded: settings.emailNotificationSettings?.onCollectionAdded ?? true,
        dailySummary: settings.emailNotificationSettings?.dailySummary ?? false,
      });
      setPreferences({
        defaultCurrency: settings.defaultCurrency || 'XAF',
        paymentMethods: settings.paymentMethods || ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
        branding: {
          logoUrl: settings.branding?.logoUrl || '',
          primaryColor: settings.branding?.primaryColor || '#1d4ed8',
        },
        notificationChannels: settings.notificationChannels || {
          email: true,
          sms: false,
          whatsapp: false,
          inApp: true,
        },
        payoutSchedule: settings.payoutSchedule || {
          frequency: 'monthly',
          dayOfMonth: 25,
          dayOfWeek: 'friday',
        },
        approvalLimitsByRole: settings.approvalLimitsByRole || {},
        officeSpendCaps: settings.officeSpendCaps || {},
        defaultBeneficiaries: settings.defaultBeneficiaries || [],
      });
    }
  }, [settings]);

  const handleSaveCompanyInfo = async () => {
    try {
      await updateCompanyInfo.mutateAsync(companyInfo);
    } catch (err) {
      console.error('Failed to update company info:', err);
    }
  };

  const handleSaveWorkflowSettings = async () => {
    try {
      await updateWorkflowSettings.mutateAsync(workflowSettings);
    } catch (err) {
      console.error('Failed to update workflow settings:', err);
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      await updateEmailNotificationSettings.mutateAsync(notificationSettings);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      if (!preferences.paymentMethods.length) {
        setPreferencesError(t('settings.paymentMethodsRequired', { defaultValue: 'Select at least one payment method.' }));
        return;
      }
      setPreferencesError(null);
      await updateCompanyPreferences.mutateAsync({
        defaultCurrency: preferences.defaultCurrency,
        paymentMethods: preferences.paymentMethods,
        logoUrl: preferences.branding.logoUrl,
        primaryColor: preferences.branding.primaryColor,
        notificationChannels: preferences.notificationChannels,
        payoutSchedule: preferences.payoutSchedule,
        approvalLimitsByRole: preferences.approvalLimitsByRole,
        officeSpendCaps: preferences.officeSpendCaps,
        defaultBeneficiaries: preferences.defaultBeneficiaries,
      } as any);
    } catch (err) {
      console.error('Failed to update company preferences:', err);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setLogoUploading(true);
      setLogoError(null);
      const response = await fileUploadService.upload(file, {
        category: 'company_logo',
        entityType: 'company',
      });
      const uploaded = (response as any)?.data || response;
      const logoUrl = uploaded?.url || uploaded?.data?.url;
      if (logoUrl) {
        setPreferences((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            logoUrl,
          },
        }));
      } else {
        setLogoError(t('settings.logoUploadFailed', { defaultValue: 'Logo upload failed.' }));
      }
    } catch (err) {
      setLogoError(t('settings.logoUploadFailed', { defaultValue: 'Logo upload failed.' }));
    } finally {
      setLogoUploading(false);
    }
  };

  const isSaving =
    updateCompanyInfo.isPending ||
    updateWorkflowSettings.isPending ||
    updateEmailNotificationSettings.isPending ||
    updateCompanyPreferences.isPending;

  const roles = rolesData?.data || [];
  const offices = officesData?.data || [];
  const beneficiaries = beneficiariesData?.data || [];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
        <ProtectedLayout title={t('settings.title')}>
          <div className="flex justify-center items-center py-16">
            <div className="text-muted-foreground">{t('common.loading', { defaultValue: 'Chargement...' })}</div>
          </div>
        </ProtectedLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
        <ProtectedLayout title={t('settings.title')}>
          <div className="flex justify-center items-center py-16">
            <div className="text-destructive">{t('common.error', { defaultValue: 'Erreur lors du chargement des paramètres' })}</div>
          </div>
        </ProtectedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <ProtectedLayout title={t('settings.title')}>
        <div className="space-y-8 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
              <p className="mt-2 text-muted-foreground">
                {t('settings.companyInfoDesc', { defaultValue: 'Gérez les informations et préférences de votre entreprise' })}
              </p>
            </div>

            {/* Basic Information */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.basic')}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.name')}
                  </label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.email')}
                  </label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      {t('common.phone')}
                    </label>
                    <input
                      type="tel"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      {t('common.industry', { defaultValue: 'Secteur' })}
                    </label>
                    <select
                      value={companyInfo.industry}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    >
                      <option value="">{t('common.selectIndustry', { defaultValue: 'Sélectionner un secteur' })}</option>
                      <option value="technology">{t('common.tech', { defaultValue: 'Technologie' })}</option>
                      <option value="finance">{t('common.finance', { defaultValue: 'Finance' })}</option>
                      <option value="healthcare">{t('common.healthcare', { defaultValue: 'Santé' })}</option>
                      <option value="manufacturing">{t('common.manufacturing', { defaultValue: 'Fabrication' })}</option>
                      <option value="retail">{t('common.retail', { defaultValue: 'Commerce' })}</option>
                      <option value="agriculture">{t('common.agriculture', { defaultValue: 'Agriculture' })}</option>
                      <option value="construction">{t('common.construction', { defaultValue: 'Construction' })}</option>
                      <option value="education">{t('common.education', { defaultValue: 'Éducation' })}</option>
                      <option value="other">{t('common.other', { defaultValue: 'Autre' })}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.address')}
                  </label>
                  <textarea
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveCompanyInfo} disabled={updateCompanyInfo.isPending}>
                    {updateCompanyInfo.isPending ? t('common.saving', { defaultValue: 'Enregistrement...' }) : t('common.save', { defaultValue: 'Enregistrer' })}
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Configuration */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.newDisbursement', { defaultValue: 'Envoyer un email pour les nouvelles demandes de décaissement' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onNewDisbursement}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, onNewDisbursement: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.disbursementApproved', { defaultValue: 'Envoyer un email quand un décaissement est approuvé' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onDisbursementApproved}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, onDisbursementApproved: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.disbursementRejected', { defaultValue: 'Envoyer un email quand un décaissement est rejeté' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onDisbursementRejected}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, onDisbursementRejected: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.dailySummary', { defaultValue: 'Envoyer un résumé quotidien des activités' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailySummary}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, dailySummary: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.collectionAdded', { defaultValue: 'Envoyer un email quand une collecte est ajoutée' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onCollectionAdded}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, onCollectionAdded: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotificationSettings} disabled={updateEmailNotificationSettings.isPending}>
                    {updateEmailNotificationSettings.isPending ? t('common.saving', { defaultValue: 'Enregistrement...' }) : t('common.save', { defaultValue: 'Enregistrer' })}
                  </Button>
                </div>
              </div>
            </div>

            {/* Payments & Currency */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.payments', { defaultValue: 'Payments & Currency' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.defaultCurrency', { defaultValue: 'Default Currency' })}</label>
                  <select
                    value={preferences.defaultCurrency}
                    onChange={(e) => setPreferences({ ...preferences, defaultCurrency: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="XAF">FCFA (XAF)</option>
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.paymentMethods', { defaultValue: 'Payment Methods' })}</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {[
                      { value: 'cash', label: t('disbursements.paymentMethods.cash', { defaultValue: 'Cash' }) },
                      { value: 'bank_transfer', label: t('disbursements.paymentMethods.bank_transfer', { defaultValue: 'Bank Transfer' }) },
                      { value: 'mobile_money', label: t('disbursements.paymentMethods.mobile_money', { defaultValue: 'Mobile Money' }) },
                      { value: 'check', label: t('disbursements.paymentMethods.check', { defaultValue: 'Check' }) },
                      { value: 'card', label: t('disbursements.paymentMethods.card', { defaultValue: 'Card' }) },
                    ].map((method) => (
                      <label key={method.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={preferences.paymentMethods.includes(method.value)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...preferences.paymentMethods, method.value]
                              : preferences.paymentMethods.filter((m) => m !== method.value);
                            setPreferences({ ...preferences, paymentMethods: next });
                            if (next.length > 0) {
                              setPreferencesError(null);
                            }
                          }}
                          className="rounded border-input"
                        />
                        {method.label}
                      </label>
                    ))}
                  </div>
                  {preferencesError && (
                    <p className="mt-2 text-xs text-red-500">{preferencesError}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSavePreferences}
                    disabled={updateCompanyPreferences.isPending || !preferences.paymentMethods.length}
                  >
                    {updateCompanyPreferences.isPending
                      ? t('common.saving', { defaultValue: 'Enregistrement...' })
                      : t('common.save', { defaultValue: 'Enregistrer' })}
                  </Button>
                </div>
              </div>
            </div>

            {/* Branding & Channels */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.branding', { defaultValue: 'Branding & Channels' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground">{t('settings.logo', { defaultValue: 'Company Logo' })}</label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
                        {preferences.branding.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preferences.branding.logoUrl}
                            alt={t('settings.logoPreview', { defaultValue: 'Logo preview' })}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleLogoUpload(file);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={logoUploading}
                          onClick={() => logoInputRef.current?.click()}
                        >
                          {logoUploading
                            ? t('settings.uploading', { defaultValue: 'Uploading...' })
                            : t('settings.uploadLogo', { defaultValue: 'Upload Logo' })}
                        </Button>
                        {logoError && <span className="text-xs text-red-500">{logoError}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">{t('settings.primaryColor', { defaultValue: 'Primary Color' })}</label>
                    <input
                      type="color"
                      value={preferences.branding.primaryColor}
                      onChange={(e) => setPreferences({ ...preferences, branding: { ...preferences.branding, primaryColor: e.target.value } })}
                      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.notificationChannels', { defaultValue: 'Notification Channels' })}</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {[
                      { key: 'email', label: t('settings.channels.email', { defaultValue: 'Email' }) },
                      { key: 'sms', label: t('settings.channels.sms', { defaultValue: 'SMS' }) },
                      { key: 'whatsapp', label: t('settings.channels.whatsapp', { defaultValue: 'WhatsApp' }) },
                      { key: 'inApp', label: t('settings.channels.inApp', { defaultValue: 'In-App' }) },
                    ].map((channel) => (
                      <label key={channel.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(preferences.notificationChannels as any)[channel.key]}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              notificationChannels: {
                                ...preferences.notificationChannels,
                                [channel.key]: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-input"
                        />
                        {channel.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Approvals & Payouts */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.approvals', { defaultValue: 'Approvals & Payouts' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.approvalLimits', { defaultValue: 'Approval Limits by Role' })}</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {roles.map((role: any) => (
                      <div key={role.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground min-w-24">{role.name}</span>
                        <input
                          type="number"
                          min={0}
                          value={preferences.approvalLimitsByRole[role.id] ?? ''}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              approvalLimitsByRole: {
                                ...preferences.approvalLimitsByRole,
                                [role.id]: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                          placeholder={t('settings.amount', { defaultValue: 'Amount' })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.officeCaps', { defaultValue: 'Office Spend Caps' })}</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {offices.map((office: any) => (
                      <div key={office.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground min-w-24">{office.name}</span>
                        <input
                          type="number"
                          min={0}
                          value={preferences.officeSpendCaps[office.id] ?? ''}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              officeSpendCaps: {
                                ...preferences.officeSpendCaps,
                                [office.id]: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                          placeholder={t('settings.amount', { defaultValue: 'Amount' })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.payoutSchedule', { defaultValue: 'Payout Schedule' })}</label>
                  <div className="mt-2 grid gap-4 sm:grid-cols-3">
                    <select
                      value={preferences.payoutSchedule.frequency}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          payoutSchedule: { ...preferences.payoutSchedule, frequency: e.target.value as any },
                        })
                      }
                      className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    >
                      <option value="weekly">{t('settings.frequency.weekly', { defaultValue: 'Weekly' })}</option>
                      <option value="biweekly">{t('settings.frequency.biweekly', { defaultValue: 'Biweekly' })}</option>
                      <option value="monthly">{t('settings.frequency.monthly', { defaultValue: 'Monthly' })}</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={preferences.payoutSchedule.dayOfMonth || ''}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          payoutSchedule: { ...preferences.payoutSchedule, dayOfMonth: Number(e.target.value) },
                        })
                      }
                      className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                      placeholder={t('settings.dayOfMonth', { defaultValue: 'Day of month' })}
                    />
                    <select
                      value={preferences.payoutSchedule.dayOfWeek || ''}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          payoutSchedule: { ...preferences.payoutSchedule, dayOfWeek: e.target.value },
                        })
                      }
                      className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    >
                      <option value="monday">{t('settings.days.monday', { defaultValue: 'Monday' })}</option>
                      <option value="tuesday">{t('settings.days.tuesday', { defaultValue: 'Tuesday' })}</option>
                      <option value="wednesday">{t('settings.days.wednesday', { defaultValue: 'Wednesday' })}</option>
                      <option value="thursday">{t('settings.days.thursday', { defaultValue: 'Thursday' })}</option>
                      <option value="friday">{t('settings.days.friday', { defaultValue: 'Friday' })}</option>
                      <option value="saturday">{t('settings.days.saturday', { defaultValue: 'Saturday' })}</option>
                      <option value="sunday">{t('settings.days.sunday', { defaultValue: 'Sunday' })}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.defaultBeneficiaries', { defaultValue: 'Default Beneficiaries' })}</label>
                  <select
                    multiple
                    value={preferences.defaultBeneficiaries}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultBeneficiaries: Array.from(e.target.selectedOptions).map((opt) => opt.value),
                      })
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    {beneficiaries.map((beneficiary: any) => (
                      <option key={beneficiary.id || beneficiary._id} value={beneficiary.id || beneficiary._id}>
                        {beneficiary.name || beneficiary.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences} disabled={updateCompanyPreferences.isPending || !preferences.paymentMethods.length}>
                    {updateCompanyPreferences.isPending ? t('common.saving', { defaultValue: 'Enregistrement...' }) : t('common.save', { defaultValue: 'Enregistrer' })}
                  </Button>
                </div>
              </div>
            </div>

            {/* Disbursement Settings */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('disbursements.workflow', { defaultValue: 'Workflow des décaissements' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('disbursements.requireDeptHeadApproval', { defaultValue: 'Approbation du chef de département requise' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={workflowSettings.requireDeptHeadApproval}
                    onChange={(e) => setWorkflowSettings({ ...workflowSettings, requireDeptHeadApproval: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('disbursements.requireValidatorApproval', { defaultValue: 'Approbation du validateur requise' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={workflowSettings.requireValidatorApproval}
                    onChange={(e) => setWorkflowSettings({ ...workflowSettings, requireValidatorApproval: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('disbursements.requireCashierExecution', { defaultValue: 'Exécution par le caissier requise' })}
                  </label>
                  <input
                    type="checkbox"
                    checked={workflowSettings.requireCashierExecution}
                    onChange={(e) => setWorkflowSettings({ ...workflowSettings, requireCashierExecution: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('disbursements.maxAmountNoApproval', { defaultValue: 'Montant maximum sans approbation' })}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-foreground">FCFA</span>
                    <input
                      type="number"
                      value={workflowSettings.maxAmountNoApproval}
                      onChange={(e) => setWorkflowSettings({ ...workflowSettings, maxAmountNoApproval: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('disbursements.currentMax', { defaultValue: 'Valeur actuelle:' })} {formatPrice(workflowSettings.maxAmountNoApproval)}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveWorkflowSettings} disabled={updateWorkflowSettings.isPending}>
                    {updateWorkflowSettings.isPending ? t('common.saving', { defaultValue: 'Enregistrement...' }) : t('common.save', { defaultValue: 'Enregistrer' })}
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
              <h2 className="text-lg font-semibold text-destructive">{t('settings.dangerZone', { defaultValue: 'Zone de danger' })}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('settings.dangerZoneDesc', { defaultValue: 'Ces actions sont irréversibles. Procédez avec prudence.' })}
              </p>
              <div className="mt-4 flex gap-4">
                <Button variant="outline">{t('settings.downloadCompanyData', { defaultValue: 'Télécharger les données' })}</Button>
                <Button variant="destructive">{t('settings.archiveCompany', { defaultValue: 'Archiver l\'entreprise' })}</Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
