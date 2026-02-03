'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import {
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useUsers,
} from '@/src/hooks/queries';

function DepartmentsContent() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', headId: '' });

  // Fetch departments from API
  const { data: departmentsData, isLoading, error } = useDepartments();

  // Fetch users for head selection dropdown
  const { data: usersData } = useUsers();

  // Mutations
  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();

  const handleAddDepartment = async () => {
    if (formData.name) {
      try {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          headId: formData.headId || undefined,
        });
        setFormData({ name: '', description: '', headId: '' });
        setShowForm(false);
      } catch (error) {
        console.error('Failed to create department:', error);
      }
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading departments...</span>
        </div>
      </CompanyLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load departments. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  const departments = departmentsData?.data ?? [];
  const users = usersData?.data ?? [];

  return (
    <CompanyLayout companyName="Company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Departments</h1>
            <p className="mt-2 text-muted-foreground">
              Organize your company into departments
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-3d gradient-bg-primary text-white">
            {showForm ? '- Cancel' : '+ Add Department'}
          </Button>
        </div>

        {/* Add Department Form */}
        {showForm && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold gradient-text">Create New Department</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Department Head
                </label>
                <select
                  value={formData.headId}
                  onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="">Select a user</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleAddDepartment}
                  disabled={createMutation.isPending || !formData.name}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Department'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {departments.length === 0 && (
          <div className="glass-card rounded-xl py-12 text-center">
            <p className="text-muted-foreground">No departments found. Create your first department.</p>
          </div>
        )}

        {/* Departments Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="glass-card rounded-xl p-6 group">
              <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">{dept.name}</h3>
              {dept.description && (
                <p className="mt-1 text-sm text-muted-foreground">{dept.description}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Head: <span className="font-medium">
                  {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Not assigned'}
                </span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Created: {new Date(dept.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDeleteDepartment(dept.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
