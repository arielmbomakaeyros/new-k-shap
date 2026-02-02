'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
  useUsers,
  useDeleteUser,
  useRoles,
  useDepartments,
} from '@/src/hooks/queries';

function CompanyUsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Fetch data from API
  const { data: usersData, isLoading, error } = useUsers();
  const { data: rolesData } = useRoles();
  const { data: departmentsData } = useDepartments();

  // Mutations
  const deleteMutation = useDeleteUser();

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading users...</span>
        </div>
      </CompanyLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load users. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  const users = usersData?.data ?? [];
  const roles = rolesData?.data ?? [];
  const departments = departmentsData?.data ?? [];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === 'all' ||
      user.systemRoles.includes(filterRole) ||
      user.roles.some((r: { id: string }) => r.id === filterRole);
    return matchesSearch && matchesRole;
  });

  // Get role display name
  const getRoleDisplay = (user: typeof users[0]) => {
    if (user.systemRoles.length > 0) {
      return user.systemRoles[0].replace(/_/g, ' ');
    }
    if (user.roles.length > 0) {
      return user.roles[0].name;
    }
    return 'No role';
  };

  // Get department display
  const getDepartmentDisplay = (user: typeof users[0]) => {
    if (user.departments && user.departments.length > 0) {
      return user.departments[0].name;
    }
    return 'Not assigned';
  };

  return (
    <CompanyLayout companyName="Company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your company users and assign roles
            </p>
          </div>
          <Button>+ Invite User</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">All Roles</option>
            <option value="company_super_admin">Company Admin</option>
            <option value="company_admin">Admin</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">No users found. Invite your first user.</p>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary capitalize">
                        {getRoleDisplay(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{getDepartmentDisplay(user)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No results after filter */}
        {users.length > 0 && filteredUsers.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-8 text-center">
            <p className="text-muted-foreground">No users match your search criteria.</p>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default function CompanyUsersPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <CompanyUsersContent />
    </ProtectedRoute>
  );
}
