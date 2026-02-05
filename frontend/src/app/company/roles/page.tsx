'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/src/components/ui/modal';
import {
  useRoles,
  useCreateRole,
  useDeleteRole,
  usePermissions,
} from '@/src/hooks/queries';
import type { Role, Permission } from '@/src/services';

function RolesContent() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Fetch roles and permissions from API
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();

  // Mutations
  const createMutation = useCreateRole();
  const deleteMutation = useDeleteRole();

  const handleTogglePermission = (permissionCode: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter((p) => p !== permissionCode)
        : [...prev.permissions, permissionCode],
    }));
  };

  const handleCreateRole = async () => {
    if (formData.name && formData.permissions.length > 0) {
      try {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          permissions: formData.permissions,
        });
        setFormData({ name: '', description: '', permissions: [] });
        setShowForm(false);
      } catch (error) {
        console.error('Failed to create role:', error);
      }
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteMutation.mutateAsync(id);
        if (selectedRole?.id === id) {
          setSelectedRole(null);
        }
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  // Loading state
  if (rolesLoading || permissionsLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading roles...</span>
        </div>
      </CompanyLayout>
    );
  }

  // Error state
  if (rolesError) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load roles. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  const roles = rolesData?.data ?? [];
  const permissions = permissionsData?.data ?? [];

  const getPermissionCode = (perm: string | Permission) =>
    typeof perm === 'string' ? perm : perm.code;

  const getPermissionLabel = (perm: string | Permission) => {
    if (typeof perm !== 'string') {
      return perm.name || perm.code;
    }

    const found = permissions.find((p) => p.code === perm);
    return found?.name || perm;
  };

  const getRolePermissionCodes = (role: Role) =>
    (role.permissions || []).map(getPermissionCode).filter(Boolean);

  return (
    <CompanyLayout companyName="Company">
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
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          size="lg"
        >
          <ModalHeader>
            <ModalTitle>Create New Role</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Approver"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this role can do"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Permissions *</label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.code)}
                        onChange={() => handleTogglePermission(perm.code)}
                        className="rounded border-input"
                      />
                      <span className="text-sm text-foreground">{perm.name}</span>
                    </label>
                  ))}
                </div>
                {permissions.length === 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No permissions available. Please configure permissions in the backend.
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-4">
            <Button
              onClick={handleCreateRole}
              disabled={createMutation.isPending || !formData.name || formData.permissions.length === 0}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {/* Empty State */}
        {roles.length === 0 && !showForm && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">No roles found. Create your first role.</p>
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
              {role.description && (
                <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
              )}

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Permissions
                </p>
                <div className="space-y-1">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <p key={getPermissionCode(perm)} className="text-xs text-muted-foreground">
                      ✓ {getPermissionLabel(perm)}
                    </p>
                  ))}
                  {role.permissions.length > 3 && (
                    <p className="text-xs text-primary">
                      +{role.permissions.length - 3} more
                    </p>
                  )}
                  {role.permissions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No permissions</p>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRole(role.id);
                  }}
                  disabled={deleteMutation.isPending || role.isSystemRole}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Role Details */}
        {selectedRole && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Role Details: {selectedRole.name}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedRole.description || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">All Permissions</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={getRolePermissionCodes(selectedRole).includes(perm.code)}
                        className="rounded border-input"
                        disabled
                      />
                      <span className="text-sm text-foreground">{perm.name}</span>
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
