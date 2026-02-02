'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

function AdminSettingsContent() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage K-shap platform configuration</p>
        </div>

        {/* Email Configuration */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Email Configuration</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">SMTP Host</label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">SMTP Port</label>
                <input
                  type="number"
                  defaultValue="587"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">SMTP User</label>
                <input
                  type="email"
                  defaultValue="admin@k-shap.com"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">From Email</label>
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
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Send error alerts to admin email
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Daily activity summary
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Alert on suspicious login attempts
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Subscription expiry reminders
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Subscription Plans</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Starter Plan</p>
                  <p className="text-sm text-muted-foreground">$299/month</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Professional Plan</p>
                  <p className="text-sm text-muted-foreground">$999/month</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Enterprise Plan</p>
                  <p className="text-sm text-muted-foreground">$2,999/month</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">API Base URL</label>
              <input
                type="text"
                defaultValue="https://api.k-shap.com"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Rate limiting enabled
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Rate limit (requests/minute)
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
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => setIsSaving(false), 1000);
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}
