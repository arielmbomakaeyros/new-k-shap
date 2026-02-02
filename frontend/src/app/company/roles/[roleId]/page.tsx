'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { PERMISSIONS, ROLE_METADATA } from '@/lib/permissions';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { PERMISSIONS } from '@/src/lib/permissions';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function RolePermissionsContent() {
  const router = useRouter();
  const params = useParams();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'dashboard:view',
    'disbursement:view',
    'collection:view',
  ]);

  const roleId = params.roleId as string;
  const roleName = roleId.replace('-', ' ').charAt(0).toUpperCase() + roleId.slice(1);

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  };

  const groupedPermissions = Object.entries(PERMISSIONS).reduce(
    (acc, [key, value]) => {
      const group = key.split(':')[0];
      if (!acc[group]) acc[group] = [];
      acc[group].push({ key, label: value });
      return acc;
    },
    {} as Record<string, { key: string; label: string }[]>
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Edit Role: {roleName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure permissions for this role
          </p>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6 sticky top-4">
              <h3 className="font-semibold text-foreground mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium text-foreground">{roleName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Permissions</p>
                  <p className="font-medium text-foreground">{selectedPermissions.length}</p>
                </div>
              </div>
              <Button className="w-full mt-6">Save Changes</Button>
            </div>
          </div>

          {/* Permissions */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {Object.entries(groupedPermissions).map(([group, permissions]) => (
                <div key={group} className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 capitalize">
                    {group}
                  </h3>
                  <div className="space-y-3">
                    {permissions.map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(key)}
                          onChange={() => togglePermission(key)}
                          className="mt-1 rounded border border-input"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{key}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <Button className="flex-1">Save All Changes</Button>
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RolePermissionsPage() {
  return (
    <ProtectedRoute>
      <RolePermissionsContent />
    </ProtectedRoute>
  );
}
