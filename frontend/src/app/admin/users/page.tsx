'use client';

import { useMemo, useState } from 'react';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useTranslation } from '@/node_modules/react-i18next';
import {
  useUsers,
  useDeleteUser,
  useToggleUserActive,
  // useUpdateUserAvatar,
} from '@/src/hooks/queries';
import type { User } from '@/src/services';
import { useUpdateUserAvatar } from '@/src/hooks/queries/useUsers';

function UsersManagerContent() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: usersData, isLoading, error } = useUsers();

  const deleteMutation = useDeleteUser();
  const toggleActiveMutation = useToggleUserActive();
  const updateAvatarMutation = useUpdateUserAvatar();

  const handleDeactivateClick = (user: User) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedUser) return;
    try {
      await toggleActiveMutation.mutateAsync({
        id: selectedUser.id,
        isActive: !selectedUser.isActive,
      });
      setActionNotice({
        type: 'success',
        message: t('users.statusUpdated', { defaultValue: 'User status updated successfully.' }),
      });
      setSelectedUser(null);
      setShowDeactivateModal(false);
    } catch (error) {
      console.error('Failed to update user status:', error);
      setActionNotice({
        type: 'error',
        message: t('users.statusUpdateFailed', { defaultValue: 'Failed to update user status.' }),
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      setActionNotice({
        type: 'success',
        message: t('users.deleteSuccess', { defaultValue: 'User deleted successfully.' }),
      });
      setSelectedUser(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setActionNotice({
        type: 'error',
        message: t('users.deleteFailed', { defaultValue: 'Failed to delete user.' }),
      });
    }
  };

  const handleAvatarChange = async (userId: string | undefined, file?: File) => {
    if (!file || !userId) return;
    await updateAvatarMutation.mutateAsync({ id: userId, file });
  };

    const users = Array.isArray(usersData?.data) ? usersData.data : [];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        filterRole === 'all' ||
        user.systemRoles.includes(filterRole) ||
        user.roles.some((r: { name: string }) => r.name.toLowerCase().includes(filterRole.toLowerCase()));
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'inactive' && !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('users.loadFailed', { defaultValue: 'Failed to load users. Please try again.' })}</p>
        </div>
      </AdminLayout>
    );
  }

  // const users = Array.isArray(usersData?.data) ? usersData.data : [];

  // const filteredUsers = useMemo(() => {
  //   return users.filter((user) => {
  //     const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
  //     const matchesSearch =
  //       fullName.includes(searchTerm.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchTerm.toLowerCase());
  //     const matchesRole =
  //       filterRole === 'all' ||
  //       user.systemRoles.includes(filterRole) ||
  //       user.roles.some((r: { name: string }) => r.name.toLowerCase().includes(filterRole.toLowerCase()));
  //     const matchesStatus =
  //       filterStatus === 'all' ||
  //       (filterStatus === 'active' && user.isActive) ||
  //       (filterStatus === 'inactive' && !user.isActive);
  //     return matchesSearch && matchesRole && matchesStatus;
  //   });
  // }, [users, searchTerm, filterRole, filterStatus]);

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const getRoleDisplay = (user: User) => {
    if (user.systemRoles.length > 0) {
      return user.systemRoles[0].replace(/_/g, ' ');
    }
    if (user.roles.length > 0) {
      return user.roles[0].name;
    }
    return t('users.noRole', { defaultValue: 'No role' });
  };

  const getCompanyDisplay = (user: User) => {
    if (user.company) {
      return typeof user.company === 'string' ? user.company : user.company.name;
    }
    return user.isKaeyrosUser
      ? t('users.kaeyrosPlatform', { defaultValue: 'Kaeyros Platform' })
      : '-';
  };

  const canDeleteUser = (user: User) =>
    !user.systemRoles?.includes('company_super_admin');

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('users.title', { defaultValue: 'Users' })}</h1>
            <p className="mt-2 text-muted-foreground">{t('users.adminSubtitle', { defaultValue: 'Manage all platform users across companies' })}</p>
          </div>
        </div>

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
            <option value="kaeyros_super_admin">{t('users.role.kaeyros_super_admin', { defaultValue: 'Kaeyros Super Admin' })}</option>
            <option value="kaeyros_admin">{t('users.role.kaeyros_admin', { defaultValue: 'Kaeyros Admin' })}</option>
            <option value="company_super_admin">{t('users.role.company_super_admin', { defaultValue: 'Company Admin' })}</option>
            <option value="company_admin">{t('users.role.company_admin', { defaultValue: 'Company Manager' })}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">{t('users.allStatus', { defaultValue: 'All Status' })}</option>
            <option value="active">{t('users.status.active', { defaultValue: 'Active' })}</option>
            <option value="inactive">{t('users.status.inactive', { defaultValue: 'Inactive' })}</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          {t('users.showing', { defaultValue: 'Showing {{count}} of {{total}} users', count: filteredUsers.length, total: users.length })}
        </div>

        {actionNotice && (
          <div
            className={`rounded-md border px-4 py-2 text-sm ${
              actionNotice.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {actionNotice.message}
          </div>
        )}

        {users.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">{t('users.empty', { defaultValue: 'No users found.' })}</p>
          </div>
        )}

        {users.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.name', { defaultValue: 'Name' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.email', { defaultValue: 'Email' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.company', { defaultValue: 'Company' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.role', { defaultValue: 'Role' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.statusLabel', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('users.joined', { defaultValue: 'Joined' })}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.actions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-sm">{getCompanyDisplay(user)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                        {getRoleDisplay(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? t('users.status.active', { defaultValue: 'Active' }) : t('users.status.inactive', { defaultValue: 'Inactive' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
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
                        <button
                          className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
                          onClick={() => handleDeactivateClick(user)}
                        >
                          {user.isActive ? t('users.deactivate', { defaultValue: 'Deactivate' }) : t('users.activate', { defaultValue: 'Activate' })}
                        </button>
                        <button
                          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleDeleteClick(user)}
                          disabled={!canDeleteUser(user)}
                          title={!canDeleteUser(user) ? t('users.deleteNotAllowed', { defaultValue: 'Cannot delete company super admin.' }) : undefined}
                        >
                          {t('common.delete', { defaultValue: 'Delete' })}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showDeactivateModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
              <p className="text-sm text-foreground">
                {t('users.confirmToggle', { defaultValue: 'Change status for {{name}}?', name: `${selectedUser.firstName} ${selectedUser.lastName}` })}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button className="rounded-md border border-border px-3 py-1" onClick={() => setShowDeactivateModal(false)}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button className="rounded-md bg-primary px-3 py-1 text-primary-foreground" onClick={handleConfirmDeactivate}>
                  {t('common.confirm', { defaultValue: 'Confirm' })}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
              <p className="text-sm text-foreground">
                {t('users.confirmDelete', { defaultValue: 'Delete {{name}}?', name: `${selectedUser.firstName} ${selectedUser.lastName}` })}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button className="rounded-md border border-border px-3 py-1" onClick={() => setShowDeleteModal(false)}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button className="rounded-md bg-destructive px-3 py-1 text-destructive-foreground" onClick={handleConfirmDelete}>
                  {t('common.delete', { defaultValue: 'Delete' })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function UsersManagerPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <UsersManagerContent />
    </ProtectedRoute>
  );
}
