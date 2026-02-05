'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/src/hooks/queries/usePlatformSettings';
import { formatPrice } from '@/src/lib/format';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        emailConfig: settings.emailConfig,
        notifications: settings.notifications,
        subscriptionPlans: settings.subscriptionPlans || [],
        apiConfig: settings.apiConfig,
        branding: settings.branding,
        slaThresholds: settings.slaThresholds || { deptHeadHours: 24, validatorHours: 24, cashierHours: 24 },
        auditLogRetentionDays: settings.auditLogRetentionDays ?? 365,
        defaultWorkflowTemplate: settings.defaultWorkflowTemplate || { name: 'Default', stages: ['department_head', 'validator', 'cashier'] },
        billingGracePeriodDays: settings.billingGracePeriodDays ?? 7,
        webhookSettings: settings.webhookSettings || { enabled: false, url: '', secret: '' },
        emailDomainsAllowlist: settings.emailDomainsAllowlist || [],
        featureFlagsByPlan: settings.featureFlagsByPlan || {},
      });
    }
  }, [settings]);

  if (isLoading || !form) {
    return (
      <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
        <ProtectedLayout title={t('settings.title')}>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</span>
          </div>
        </ProtectedLayout>
      </ProtectedRoute>
    );
  }

  const handleSave = async () => {
    await updateMutation.mutateAsync(form);
  };

  const featureKeys = [
    'disbursements',
    'collections',
    'reports',
    'apiAccess',
    'multiCurrency',
    'chat',
    'notifications',
    'emailNotifications',
  ];

  const planKeys =
    form.featureFlagsByPlan && Object.keys(form.featureFlagsByPlan).length > 0
      ? Object.keys(form.featureFlagsByPlan)
      : ['free', 'starter', 'professional', 'enterprise'];

  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <ProtectedLayout title={t('settings.title')}>
        <div className="space-y-8 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
              <p className="mt-2 text-muted-foreground">{t('settings.adminConfig', { defaultValue: 'Manage K-shap platform configuration' })}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.emailConfig', { defaultValue: 'Email Configuration' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.smtpHost', { defaultValue: 'SMTP Host' })}</label>
                  <input
                    type="text"
                    value={form.emailConfig.smtpHost}
                    onChange={(e) => setForm({ ...form, emailConfig: { ...form.emailConfig, smtpHost: e.target.value } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground">{t('settings.smtpPort', { defaultValue: 'SMTP Port' })}</label>
                    <input
                      type="number"
                      value={form.emailConfig.smtpPort}
                      onChange={(e) => setForm({ ...form, emailConfig: { ...form.emailConfig, smtpPort: Number(e.target.value) } })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">{t('settings.smtpUser', { defaultValue: 'SMTP User' })}</label>
                    <input
                      type="text"
                      value={form.emailConfig.smtpUser}
                      onChange={(e) => setForm({ ...form, emailConfig: { ...form.emailConfig, smtpUser: e.target.value } })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.fromEmail', { defaultValue: 'From Email' })}</label>
                  <input
                    type="email"
                    value={form.emailConfig.fromEmail}
                    onChange={(e) => setForm({ ...form, emailConfig: { ...form.emailConfig, fromEmail: e.target.value } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h2>
              <div className="mt-4 space-y-4">
                {Object.entries(form.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{key}</label>
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => setForm({ ...form, notifications: { ...form.notifications, [key]: e.target.checked } })}
                      className="rounded border-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.subscriptionPlans', { defaultValue: 'Subscription Plans' })}</h2>
              <div className="mt-4 space-y-4">
                {form.subscriptionPlans.map((plan: any, idx: number) => (
                  <div key={idx} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(plan.price)}/{plan.billingPeriod}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.apiConfig', { defaultValue: 'API Configuration' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.apiBaseUrl', { defaultValue: 'API Base URL' })}</label>
                  <input
                    type="text"
                    value={form.apiConfig.apiBaseUrl}
                    onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, apiBaseUrl: e.target.value } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">{t('settings.rateLimitingEnabled', { defaultValue: 'Rate limiting enabled' })}</label>
                  <input
                    type="checkbox"
                    checked={!!form.apiConfig.rateLimitingEnabled}
                    onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, rateLimitingEnabled: e.target.checked } })}
                    className="rounded border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.rateLimit', { defaultValue: 'Rate limit (requests/minute)' })}</label>
                  <input
                    type="number"
                    value={form.apiConfig.rateLimit}
                    onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, rateLimit: Number(e.target.value) } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.sla', { defaultValue: 'SLA Thresholds' })}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.slaDeptHead', { defaultValue: 'Dept Head (hours)' })}</label>
                  <input
                    type="number"
                    value={form.slaThresholds.deptHeadHours}
                    onChange={(e) => setForm({ ...form, slaThresholds: { ...form.slaThresholds, deptHeadHours: Number(e.target.value) } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.slaValidator', { defaultValue: 'Validator (hours)' })}</label>
                  <input
                    type="number"
                    value={form.slaThresholds.validatorHours}
                    onChange={(e) => setForm({ ...form, slaThresholds: { ...form.slaThresholds, validatorHours: Number(e.target.value) } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.slaCashier', { defaultValue: 'Cashier (hours)' })}</label>
                  <input
                    type="number"
                    value={form.slaThresholds.cashierHours}
                    onChange={(e) => setForm({ ...form, slaThresholds: { ...form.slaThresholds, cashierHours: Number(e.target.value) } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.retention', { defaultValue: 'Retention & Billing' })}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.auditRetention', { defaultValue: 'Audit Log Retention (days)' })}</label>
                  <input
                    type="number"
                    value={form.auditLogRetentionDays}
                    onChange={(e) => setForm({ ...form, auditLogRetentionDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.billingGrace', { defaultValue: 'Billing Grace Period (days)' })}</label>
                  <input
                    type="number"
                    value={form.billingGracePeriodDays}
                    onChange={(e) => setForm({ ...form, billingGracePeriodDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.workflowTemplate', { defaultValue: 'Default Workflow Template' })}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.templateName', { defaultValue: 'Template Name' })}</label>
                  <input
                    type="text"
                    value={form.defaultWorkflowTemplate.name}
                    onChange={(e) => setForm({ ...form, defaultWorkflowTemplate: { ...form.defaultWorkflowTemplate, name: e.target.value } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.templateStages', { defaultValue: 'Stages (comma separated)' })}</label>
                  <input
                    type="text"
                    value={form.defaultWorkflowTemplate.stages.join(', ')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        defaultWorkflowTemplate: {
                          ...form.defaultWorkflowTemplate,
                          stages: e.target.value.split(',').map((v: string) => v.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.webhooks', { defaultValue: 'Webhooks' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">{t('settings.webhookEnabled', { defaultValue: 'Enable Webhooks' })}</label>
                  <input
                    type="checkbox"
                    checked={!!form.webhookSettings.enabled}
                    onChange={(e) => setForm({ ...form, webhookSettings: { ...form.webhookSettings, enabled: e.target.checked } })}
                    className="rounded border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.webhookUrl', { defaultValue: 'Webhook URL' })}</label>
                  <input
                    type="text"
                    value={form.webhookSettings.url}
                    onChange={(e) => setForm({ ...form, webhookSettings: { ...form.webhookSettings, url: e.target.value } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">{t('settings.webhookSecret', { defaultValue: 'Webhook Secret' })}</label>
                  <input
                    type="text"
                    value={form.webhookSettings.secret}
                    onChange={(e) => setForm({ ...form, webhookSettings: { ...form.webhookSettings, secret: e.target.value } })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.emailAllowlist', { defaultValue: 'Email Domains Allowlist' })}</h2>
              <div className="mt-4">
                <textarea
                  value={form.emailDomainsAllowlist.join('\n')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emailDomainsAllowlist: e.target.value.split('\n').map((v: string) => v.trim()).filter(Boolean),
                    })
                  }
                  rows={4}
                  placeholder="example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t('settings.featureFlags', { defaultValue: 'Feature Flags by Plan' })}</h2>
              <div className="mt-4 space-y-6">
                {planKeys.map((plan) => (
                  <div key={plan} className="rounded-md border border-border p-4">
                    <div className="text-sm font-semibold text-foreground capitalize">{plan}</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {featureKeys.map((feature) => (
                        <label key={`${plan}-${feature}`} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!form.featureFlagsByPlan?.[plan]?.[feature]}
                            onChange={(e) => {
                              const next = {
                                ...(form.featureFlagsByPlan || {}),
                                [plan]: {
                                  ...(form.featureFlagsByPlan?.[plan] || {}),
                                  [feature]: e.target.checked,
                                },
                              };
                              setForm({ ...form, featureFlagsByPlan: next });
                            }}
                            className="rounded border-input"
                          />
                          {t(`settings.feature.${feature}`, { defaultValue: feature })}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  {t('settings.featureFlagsHelp', { defaultValue: 'Toggle features per plan.' })}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline">{t('common.cancel', { defaultValue: 'Cancel' })}</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('common.saving', { defaultValue: 'Saving...' }) : t('settings.save', { defaultValue: 'Save Settings' })}
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
