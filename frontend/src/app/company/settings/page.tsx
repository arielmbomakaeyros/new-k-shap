'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

export default function CompanySettingsPage() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <ProtectedLayout title={t('settings.title')}>
        <div className="space-y-8 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
              <p className="mt-2 text-muted-foreground">
                {t('settings.companyInfoDesc', { defaultValue: 'Manage your company information and preferences' })}
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
                    defaultValue="Acme Corporation"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.email')}
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@acme.com"
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
                      defaultValue="+1 (555) 123-4567"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      {t('common.industry', { defaultValue: 'Industry' })}
                    </label>
                    <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                      <option>{t('common.tech', { defaultValue: 'Technology' })}</option>
                      <option>{t('common.finance', { defaultValue: 'Finance' })}</option>
                      <option>{t('common.healthcare', { defaultValue: 'Healthcare' })}</option>
                      <option>{t('common.manufacturing', { defaultValue: 'Manufacturing' })}</option>
                      <option>{t('common.retail', { defaultValue: 'Retail' })}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.address')}
                  </label>
                  <textarea
                    defaultValue="123 Business Ave, New York, NY 10001"
                    rows={3}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Email Configuration */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.newDisbursement', { defaultValue: 'Send email on new disbursement request' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.disbursementApproved', { defaultValue: 'Send email when disbursement is approved' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.dailySummary', { defaultValue: 'Send daily activity summary' })}
                  </label>
                  <input type="checkbox" className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.emailNotifications.collectionAdded', { defaultValue: 'Send email when collection is added' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
              </div>
            </div>

            {/* Disbursement Settings */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('disbursements.workflow', { defaultValue: 'Disbursement Workflow' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('disbursements.requireDeptHeadApproval', { defaultValue: 'Require department head approval' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('disbursements.requireValidatorApproval', { defaultValue: 'Require validator approval' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('disbursements.requireCashierExecution', { defaultValue: 'Require cashier execution' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    {t('disbursements.maxAmountNoApproval', { defaultValue: 'Maximum disbursement amount (no approval needed)' })}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-foreground">$</span>
                    <input
                      type="number"
                      defaultValue="5000"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
              <h2 className="text-lg font-semibold text-destructive">{t('settings.dangerZone', { defaultValue: 'Danger Zone' })}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('settings.dangerZoneDesc', { defaultValue: 'These actions cannot be undone. Please proceed with caution.' })}
              </p>
              <div className="mt-4 flex gap-4">
                <Button variant="outline">{t('settings.downloadCompanyData', { defaultValue: 'Download Company Data' })}</Button>
                <Button variant="destructive">{t('settings.archiveCompany', { defaultValue: 'Archive Company' })}</Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">{t('common.cancel')}</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('common.saving', { defaultValue: 'Saving...' }) : t('settings.save')}
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
