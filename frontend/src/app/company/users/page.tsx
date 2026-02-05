'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/src/components/ui/modal';
import { useTranslation } from '@/node_modules/react-i18next';
import {
  useUsers,
  useDeleteUser,
  useRoles,
  useDepartments,
  useCreateUser,
  useUpdateUser,
  // useUpdateUserAvatar,
} from '@/src/hooks/queries';
import { useUpdateUserAvatar } from '@/src/hooks/queries/useUsers';
import type { User } from '@/src/services';

function CompanyUsersContent() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    title: string;
    message: string;
    details: string[];
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    systemRole: 'agent',
    roleId: '',
    departmentId: '',
  });

  // Fetch data from API
  const { data: usersData, isLoading, error } = useUsers();
  const { data: rolesData } = useRoles();
  const { data: departmentsData } = useDepartments();

  // Mutations
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const updateAvatarMutation = useUpdateUserAvatar();

  const getErrorDetails = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object') {
      const maybeError = error as { message?: string; errors?: Record<string, string[]> };
      const details = maybeError.errors
        ? Object.entries(maybeError.errors).map(
            ([field, messages]) => `${field}: ${messages.join(' ')}`
          )
        : [];
      return {
        message: maybeError.message || fallback,
        details,
      };
    }
    return { message: fallback, details: [] };
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm(t('users.confirmRemove', { defaultValue: 'Are you sure you want to remove this user?' }))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete user:', error);
        const { message, details } = getErrorDetails(
          error,
          t('users.deleteFailed', { defaultValue: 'Failed to delete user.' })
        );
        setErrorModal({
          title: t('common.error', { defaultValue: 'Error' }),
          message,
          details,
        });
      }
    }
  };

  const handleAvatarChange = async (userId: string | undefined, file?: File) => {
    if (!file || !userId) return;
    try {
      await updateAvatarMutation.mutateAsync({ id: userId, file });
    } catch (error) {
      console.error('Failed to update avatar:', error);
      const { message, details } = getErrorDetails(
        error,
        t('users.avatarUpdateFailed', { defaultValue: 'Failed to update user photo.' })
      );
      setErrorModal({
        title: t('common.error', { defaultValue: 'Error' }),
        message,
        details,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      systemRole: 'agent',
      roleId: '',
      departmentId: '',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: User) => {
    const systemRole = user.systemRoles?.[0] || '';
    const roleId = user.roles?.[0]?.id || user.roles?.[0]?._id || user.roles?.[0]?.name || '';
    const departmentId = user.departments?.[0]?.id || user.departments?.[0]?._id || user.departments?.[0]?.name || '';

    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      systemRole: systemRole || 'agent',
      roleId: roleId || '',
      departmentId: departmentId || '',
    });
    setShowEditModal(true);
  };

  const resolveId = (value: string, list: any[]) => {
    if (!value) return '';
    if (/^[0-9a-fA-F]{24}$/.test(value)) return value;
    const match = list.find(
      (item) => item?.id === value || item?._id === value || item?.name === value
    );
    return match?.id || match?._id || '';
  };

  const handleCreateUser = async () => {
    try {
      const resolvedRoleId = resolveId(formData.roleId, roles);
      const resolvedDepartmentId = resolveId(formData.departmentId, departments);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        systemRoles: formData.roleId ? [] : [formData.systemRole],
        roles: resolvedRoleId ? [resolvedRoleId] : [],
        departments: resolvedDepartmentId ? [resolvedDepartmentId] : [],
      };
      await createMutation.mutateAsync(payload);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create user:', err);
      const { message, details } = getErrorDetails(
        err,
        t('users.createFailed', { defaultValue: 'Failed to create user.' })
      );
      setErrorModal({
        title: t('common.error', { defaultValue: 'Error' }),
        message,
        details,
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const resolvedRoleId = resolveId(formData.roleId, roles);
      const resolvedDepartmentId = resolveId(formData.departmentId, departments);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        // email: formData.email,
        phone: formData.phone || undefined,
        systemRoles: formData.roleId ? [] : [formData.systemRole],
        roles: resolvedRoleId ? [resolvedRoleId] : [],
        departments: resolvedDepartmentId ? [resolvedDepartmentId] : [],
      };
      await updateMutation.mutateAsync({ id: selectedUser._id!, data: payload });
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update user:', err);
      const { message, details } = getErrorDetails(
        err,
        t('users.updateFailed', { defaultValue: 'Failed to update user.' })
      );
      setErrorModal({
        title: t('common.error', { defaultValue: 'Error' }),
        message,
        details,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('users.loading', { defaultValue: 'Loading users...' })}</span>
        </div>
      </CompanyLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('users.loadFailed', { defaultValue: 'Failed to load users. Please try again.' })}</p>
        </div>
      </CompanyLayout>
    );
  }

  const users = usersData?.data ?? [];
  const roles = rolesData?.data ?? [];
  const departments = departmentsData?.data ?? [];

  // Filter users
  const filteredUsers = users?.filter((user) => {
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
    <CompanyLayout companyName={t('users.companyTitle', { defaultValue: 'Company' })}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('users.title', { defaultValue: 'Users' })}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('users.companySubtitle', { defaultValue: 'Manage your company users and assign roles' })}
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            {t('users.invite', { defaultValue: '+ Invite User' })}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder={t('users.searchPlaceholder', { defaultValue: 'Search users...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">{t('users.allRoles', { defaultValue: 'All Roles' })}</option>
            <option value="company_super_admin">{t('users.role.company_super_admin', { defaultValue: 'Company Admin' })}</option>
            <option value="company_admin">{t('users.role.company_admin', { defaultValue: 'Admin' })}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {t('users.showing', { defaultValue: 'Showing {{count}} of {{total}} users', count: filteredUsers.length, total: users.length })}
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">{t('users.empty', { defaultValue: 'No users found. Invite your first user.' })}</p>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full">
              <thead className="bg-muted/70 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.name', { defaultValue: 'Name' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.email', { defaultValue: 'Email' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.role', { defaultValue: 'Role' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.department', { defaultValue: 'Department' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.statusLabel', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.joined', { defaultValue: 'Joined' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.actions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground">{user.systemRoles?.[0]?.replace(/_/g, ' ') || ''}</div>
                        </div>
                      </div>
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
                        {user.isActive ? t('users.status.active', { defaultValue: 'Active' }) : t('users.status.inactive', { defaultValue: 'Inactive' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <label className="inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                          {t('users.uploadPhoto', { defaultValue: 'Upload Photo' })}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAvatarChange(user.id || (user as any)._id, e.target.files?.[0])}
                          />
                        </label>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(user)}>
                          {t('common.edit', { defaultValue: 'Edit' })}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? t('common.removing', { defaultValue: 'Removing...' }) : t('common.remove', { defaultValue: 'Remove' })}
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
            <p className="text-muted-foreground">{t('users.noMatch', { defaultValue: 'No users match your search criteria.' })}</p>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground">{t('users.create', { defaultValue: 'Create User' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t('users.firstName', { defaultValue: 'First Name' })}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t('users.lastName', { defaultValue: 'Last Name' })}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <input
                  disabled
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.email', { defaultValue: 'Email' })}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.phone', { defaultValue: 'Phone' })}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.systemRole}
                    onChange={(e) => setFormData({ ...formData, systemRole: e.target.value, roleId: '' })}
                  >
                    <option value="company_super_admin">Company Super Admin</option>
                    <option value="validator">Validator</option>
                    <option value="department_head">Department Head</option>
                    <option value="cashier">Cashier</option>
                    <option value="agent">Agent</option>
                    <option value="accountant">Accountant</option>
                  </select>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value="">{t('users.assignRole', { defaultValue: 'Assign Role' })}</option>
                    {roles.map((role) => {
                      const roleId = role.id || role._id;
                      return (
                      <option key={roleId} value={roleId}>
                        {role.name}
                      </option>
                    )})}
                  </select>
                </div>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">{t('users.department', { defaultValue: 'Department' })}</option>
                  {departments.map((dept) => {
                    const deptId = dept.id || dept._id;
                    return (
                      <option key={deptId} value={deptId}>
                        {dept.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button onClick={handleCreateUser} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.loading', { defaultValue: 'Loading...' }) : t('users.create', { defaultValue: 'Create User' })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground">{t('users.edit', { defaultValue: 'Edit User' })}</h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t('users.firstName', { defaultValue: 'First Name' })}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t('users.lastName', { defaultValue: 'Last Name' })}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.email', { defaultValue: 'Email' })}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.phone', { defaultValue: 'Phone' })}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.systemRole}
                    onChange={(e) => setFormData({ ...formData, systemRole: e.target.value, roleId: '' })}
                  >
                    <option value="company_super_admin">Company Super Admin</option>
                    <option value="validator">Validator</option>
                    <option value="department_head">Department Head</option>
                    <option value="cashier">Cashier</option>
                    <option value="agent">Agent</option>
                    <option value="accountant">Accountant</option>
                  </select>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value="">{t('users.assignRole', { defaultValue: 'Assign Role' })}</option>
                    {roles.map((role) => {
                      const roleId = role.id || role._id;
                      return (
                        <option key={roleId} value={roleId}>
                        {role.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">{t('users.department', { defaultValue: 'Department' })}</option>
                  {departments.map((dept) => {
                    const deptId = dept.id || dept._id;
                    return (
                      <option key={deptId} value={deptId}>
                        {dept.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button onClick={handleUpdateUser} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('common.loading', { defaultValue: 'Loading...' }) : t('common.saveChanges', { defaultValue: 'Save Changes' })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {errorModal && (
          <Modal isOpen={!!errorModal} onClose={() => setErrorModal(null)} size="md">
            <ModalHeader>
              <ModalTitle>{errorModal.title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-foreground">{errorModal.message}</p>
              {errorModal.details.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {errorModal.details.map((detail, index) => (
                    <li key={`${detail}-${index}`}>{detail}</li>
                  ))}
                </ul>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-end">
              <Button onClick={() => setErrorModal(null)}>
                {t('common.close', { defaultValue: 'Close' })}
              </Button>
            </ModalFooter>
          </Modal>
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
