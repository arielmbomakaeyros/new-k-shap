'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/components/company/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';

function CompanySettingsContent() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <CompanyLayout companyName="Acme Corporation">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your company information and preferences
          </p>
        </div>

        {/* Basic Information */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Acme Corporation"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Company Email
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Industry
                </label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Company Address
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
          <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Send email on new disbursement request
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Send email when disbursement is approved
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Send daily activity summary
              </label>
              <input type="checkbox" className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Send email when collection is added
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
          </div>
        </div>

        {/* Disbursement Settings */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Disbursement Workflow</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Require department head approval
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Require validator approval
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Require cashier execution
              </label>
              <input type="checkbox" defaultChecked className="rounded border-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Maximum disbursement amount (no approval needed)
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
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These actions cannot be undone. Please proceed with caution.
          </p>
          <div className="mt-4 flex gap-4">
            <Button variant="outline">Download Company Data</Button>
            <Button variant="destructive">Archive Company</Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function CompanySettingsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <CompanySettingsContent />
    </ProtectedRoute>
  );
}
