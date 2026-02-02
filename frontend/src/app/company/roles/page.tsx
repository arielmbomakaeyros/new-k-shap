'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/components/company/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

const availablePermissions = [
  { id: 'create_disbursement', label: 'Create Disbursements' },
  { id: 'approve_disbursement', label: 'Approve Disbursements' },
  { id: 'execute_disbursement', label: 'Execute Disbursements' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'manage_departments', label: 'Manage Departments' },
  { id: 'view_analytics', label: 'View Analytics' },
  { id: 'export_data', label: 'Export Data' },
  { id: 'manage_settings', label: 'Manage Company Settings' },
  { id: 'approve_collections', label: 'Approve Collections' },
];

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Validator',
      description: 'Can validate and approve disbursements',
      permissions: ['approve_disbursement', 'view_reports', 'view_analytics'],
      usersCount: 2,
    },
    {
      id: '2',
      name: 'Department Head',
      description: 'Manages department and approves requests',
      permissions: ['create_disbursement', 'approve_disbursement', 'view_reports'],
      usersCount: 3,
    },
    {
      id: '3',
      name: 'Agent',
      description: 'Creates disbursement requests',
      permissions: ['create_disbursement', 'view_reports'],
      usersCount: 7,
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <CompanyLayout companyName="Acme Corporation">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
            <p className="mt-2 text-muted-foreground">
              Define roles and assign permissions for your team
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '- Cancel' : '+ Create Role'}
          </Button>
        </div>

        {/* Create Role Form */}
        {showForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Create New Role</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., Approver"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  placeholder="Describe what this role can do"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Permissions</label>
                <div className="mt-2 space-y-2">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                      />
                      <span className="text-sm text-foreground">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button>Create Role</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`rounded-lg border-2 bg-card p-6 cursor-pointer transition-colors ${
                selectedRole?.id === role.id ? 'border-primary' : 'border-border'
              }`}
              onClick={() => setSelectedRole(role)}
            >
              <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Permissions
                </p>
                <div className="space-y-1">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <p key={perm} className="text-xs text-muted-foreground">
                      ✓ {availablePermissions.find((p) => p.id === perm)?.label}
                    </p>
                  ))}
                  {role.permissions.length > 3 && (
                    <p className="text-xs text-primary">
                      +{role.permissions.length - 3} more
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Assigned to <span className="font-bold">{role.usersCount}</span> users
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="flex-1">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Role Details */}
        {selectedRole && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Role Details: {selectedRole.name}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedRole.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">All Permissions</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.includes(perm.id)}
                        className="rounded border-input"
                        disabled
                      />
                      <span className="text-sm text-foreground">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button>Update Role</Button>
                <Button variant="outline" onClick={() => setSelectedRole(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default function RolesPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <RolesContent />
    </ProtectedRoute>
  );
}
