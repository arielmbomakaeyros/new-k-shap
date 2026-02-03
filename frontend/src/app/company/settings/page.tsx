'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import {
  useCompanySettings,
  useUpdateCompanyInfo,
  useUpdateWorkflowSettings,
  useUpdateEmailNotificationSettings,
} from '@/src/hooks/queries';
import { formatPrice } from '@/src/lib/format';

export default function CompanySettingsPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading, error } = useCompanySettings();
  const updateCompanyInfo = useUpdateCompanyInfo();
  const updateWorkflowSettings = useUpdateWorkflowSettings();
  const updateEmailNotificationSettings = useUpdateEmailNotificationSettings();

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

  const isSaving = updateCompanyInfo.isPending || updateWorkflowSettings.isPending || updateEmailNotificationSettings.isPending;

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
