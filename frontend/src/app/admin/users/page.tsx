'use client';

import { useMemo, useState } from 'react';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetBody } from '@/src/components/ui/sheet';
import { ConfirmModal } from '@/src/components/ui/modal';
import { ImageUp, Trash2, UserX, CheckCircle2, Eye } from 'lucide-react';
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

  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);
  const [confirmReactivate, setConfirmReactivate] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [uploadingUserIds, setUploadingUserIds] = useState<Record<string, boolean>>({});
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: usersData, isLoading, error } = useUsers();

  const deleteMutation = useDeleteUser();
  const toggleActiveMutation = useToggleUserActive();
  const updateAvatarMutation = useUpdateUserAvatar();

  const handleDeactivateUser = async (user: User) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: user.id,
        isActive: false,
      });
      setActionNotice({
        type: 'success',
        message: t('users.statusUpdated', { defaultValue: 'User status updated successfully.' }),
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
      setActionNotice({
        type: 'error',
        message: t('users.statusUpdateFailed', { defaultValue: 'Failed to update user status.' }),
      });
    }
  };

  const handleReactivateUser = async (user: User) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: user.id,
        isActive: true,
      });
      setActionNotice({
        type: 'success',
        message: t('users.statusUpdated', { defaultValue: 'User status updated successfully.' }),
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
      setActionNotice({
        type: 'error',
        message: t('users.statusUpdateFailed', { defaultValue: 'Failed to update user status.' }),
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteMutation.mutateAsync(user.id);
      setActionNotice({
        type: 'success',
        message: t('users.deleteSuccess', { defaultValue: 'User deleted successfully.' }),
      });
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
    setUploadingUserIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateAvatarMutation.mutateAsync({ id: userId, file });
      setActionNotice({
        type: 'success',
        message: t('users.avatarUpdated', { defaultValue: 'User photo updated.' }),
      });
    } catch (error) {
      console.error('Failed to update avatar:', error);
      setActionNotice({
        type: 'error',
        message: t('users.avatarUpdateFailed', { defaultValue: 'Failed to update user photo.' }),
      });
    } finally {
      setUploadingUserIds((prev) => ({ ...prev, [userId]: false }));
    }
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
                {filteredUsers.map((user) => {
                  const userId = user.id || (user as any)._id;
                  const uploadInputId = `admin-user-avatar-${userId}`;
                  const isUploadingAvatar = Boolean(uploadingUserIds[userId]);

                  return (
                  <tr key={userId} className="hover:bg-muted/50">
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
                          <button
                            type="button"
                            onClick={() => setProfileUser(user)}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {user.firstName} {user.lastName}
                          </button>
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
                      <TooltipProvider>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon-sm" variant="ghost" onClick={() => setProfileUser(user)} aria-label="View user">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t('users.view', { defaultValue: 'View' })}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon-sm" variant="ghost" aria-label="Upload photo" asChild>
                                <label
                                  htmlFor={uploadInputId}
                                  className={`cursor-pointer ${isUploadingAvatar ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                  <ImageUp className="h-4 w-4" />
                                </label>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t('users.uploadPhoto', { defaultValue: 'Upload Photo' })}
                            </TooltipContent>
                          </Tooltip>
                          <input
                            id={uploadInputId}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAvatarChange(userId, e.target.files?.[0])}
                          />

                          {user.isActive ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => setConfirmDeactivate(user)}
                                  aria-label="Deactivate user"
                                >
                                  <UserX className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('users.deactivate', { defaultValue: 'Deactivate' })}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => setConfirmReactivate(user)}
                                  aria-label="Reactivate user"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('users.activate', { defaultValue: 'Activate' })}
                              </TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setConfirmDelete(user)}
                                disabled={!canDeleteUser(user)}
                                aria-label="Delete user"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canDeleteUser(user)
                                ? t('common.delete', { defaultValue: 'Delete' })
                                : t('users.deleteNotAllowed', { defaultValue: 'Cannot delete company super admin.' })}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmModal
          isOpen={!!confirmDeactivate}
          onClose={() => setConfirmDeactivate(null)}
          onConfirm={() => confirmDeactivate && handleDeactivateUser(confirmDeactivate)}
          title={t('users.deactivateTitle', { defaultValue: 'Deactivate User' })}
          message={t('users.deactivateConfirm', {
            defaultValue: 'Deactivate {{name}}? They will not be able to sign in.',
            name: confirmDeactivate ? `${confirmDeactivate.firstName} ${confirmDeactivate.lastName}` : '',
          })}
          confirmLabel={t('users.deactivate', { defaultValue: 'Deactivate' })}
          cancelLabel={t('common.cancel', { defaultValue: 'Cancel' })}
          variant="warning"
          isLoading={toggleActiveMutation.isPending}
        />

        <ConfirmModal
          isOpen={!!confirmReactivate}
          onClose={() => setConfirmReactivate(null)}
          onConfirm={() => confirmReactivate && handleReactivateUser(confirmReactivate)}
          title={t('users.reactivateTitle', { defaultValue: 'Reactivate User' })}
          message={t('users.reactivateConfirm', {
            defaultValue: 'Reactivate {{name}}? They will be able to sign in again.',
            name: confirmReactivate ? `${confirmReactivate.firstName} ${confirmReactivate.lastName}` : '',
          })}
          confirmLabel={t('users.activate', { defaultValue: 'Activate' })}
          cancelLabel={t('common.cancel', { defaultValue: 'Cancel' })}
          variant="success"
          isLoading={toggleActiveMutation.isPending}
        />

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => confirmDelete && handleDeleteUser(confirmDelete)}
          title={t('users.deleteTitle', { defaultValue: 'Delete User' })}
          message={t('users.confirmDelete', {
            defaultValue: 'Delete {{name}}? This action cannot be undone.',
            name: confirmDelete ? `${confirmDelete.firstName} ${confirmDelete.lastName}` : '',
          })}
          confirmLabel={t('common.delete', { defaultValue: 'Delete' })}
          cancelLabel={t('common.cancel', { defaultValue: 'Cancel' })}
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        <Sheet
          isOpen={!!profileUser}
          onClose={() => setProfileUser(null)}
          position="right"
          size="lg"
        >
          <SheetHeader>
            <SheetTitle>{profileUser?.firstName} {profileUser?.lastName}</SheetTitle>
            <SheetDescription>{profileUser?.email}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            {profileUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
                    {profileUser.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profileUser.avatar} alt={profileUser.firstName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                        {profileUser.firstName?.[0]}{profileUser.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{profileUser.firstName} {profileUser.lastName}</p>
                    <p className="text-sm text-muted-foreground">{getCompanyDisplay(profileUser)}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t('users.role', { defaultValue: 'Role' })}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{getRoleDisplay(profileUser)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t('users.statusLabel', { defaultValue: 'Status' })}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {profileUser.isActive ? t('users.status.active', { defaultValue: 'Active' }) : t('users.status.inactive', { defaultValue: 'Inactive' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SheetBody>
        </Sheet>
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
