'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <ProtectedLayout title={t('settings.title')}>
        <div className="space-y-8 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
              <p className="mt-2 text-muted-foreground">{t('settings.adminConfig', { defaultValue: 'Manage K-shap platform configuration' })}</p>
            </div>

            {/* Email Configuration */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.emailConfig', { defaultValue: 'Email Configuration' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.smtpHost', { defaultValue: 'SMTP Host' })}</label>
                  <input
                    type="text"
                    defaultValue="smtp.gmail.com"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground">{t('settings.smtpPort', { defaultValue: 'SMTP Port' })}</label>
                    <input
                      type="number"
                      defaultValue="587"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">{t('settings.smtpUser', { defaultValue: 'SMTP User' })}</label>
                    <input
                      type="email"
                      defaultValue="admin@k-shap.com"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.fromEmail', { defaultValue: 'From Email' })}</label>
                  <input
                    type="email"
                    defaultValue="noreply@k-shap.com"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.sendErrorAlerts', { defaultValue: 'Send error alerts to admin email' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.dailyActivitySummary', { defaultValue: 'Daily activity summary' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.suspiciousLoginAlerts', { defaultValue: 'Alert on suspicious login attempts' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.subscriptionReminders', { defaultValue: 'Subscription expiry reminders' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.subscriptionPlans', { defaultValue: 'Subscription Plans' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{t('settings.starterPlan', { defaultValue: 'Starter Plan' })}</p>
                      <p className="text-sm text-muted-foreground">$299/{t('common.month', { defaultValue: 'month' })}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('common.edit', { defaultValue: 'Edit' })}
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{t('settings.professionalPlan', { defaultValue: 'Professional Plan' })}</p>
                      <p className="text-sm text-muted-foreground">$999/{t('common.month', { defaultValue: 'month' })}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('common.edit', { defaultValue: 'Edit' })}
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{t('settings.enterprisePlan', { defaultValue: 'Enterprise Plan' })}</p>
                      <p className="text-sm text-muted-foreground">$2,999/{t('common.month', { defaultValue: 'month' })}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('common.edit', { defaultValue: 'Edit' })}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.apiConfig', { defaultValue: 'API Configuration' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.apiBaseUrl', { defaultValue: 'API Base URL' })}</label>
                  <input
                    type="text"
                    defaultValue="https://api.k-shap.com"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.rateLimitingEnabled', { defaultValue: 'Rate limiting enabled' })}
                  </label>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {t('settings.rateLimit', { defaultValue: 'Rate limit (requests/minute)' })}
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">{t('common.cancel', { defaultValue: 'Cancel' })}</Button>
              <Button
                onClick={() => {
                  setIsSaving(true);
                  setTimeout(() => setIsSaving(false), 1000);
                }}
                disabled={isSaving}
              >
                {isSaving ? t('common.saving', { defaultValue: 'Saving...' }) : t('settings.save', { defaultValue: 'Save Settings' })}
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
