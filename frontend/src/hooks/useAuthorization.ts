'use client';

import { useAuthStore } from '@/src/store/authStore';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  isAdmin,
  isKaeyrosUser,
  isFinanceRole,
  isApprover,
  getPermissionDescription,
} from '@/src/lib/rbac';
import { Permission } from '@/src/lib/permissions';

/**
 * Hook for checking user authorization and permissions
 */
export function useAuthorization() {
  const user = useAuthStore((state) => state.user);

  return {
    user,

    // Permission checks
    can: (permission: Permission) => hasPermission(user, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(user, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(user, permissions),

    // Role checks
    isAdmin: () => isAdmin(user),
    isKaeyrosUser: () => isKaeyrosUser(user),
    isFinanceRole: () => isFinanceRole(user),
    isApprover: (stage?: string) => isApprover(user, stage),

    // Utilities
    getPermissions: () => getUserPermissions(user),
    getPermissionDescription: (permission: Permission) => getPermissionDescription(permission),

    // Authentication checks
    isAuthenticated: () => !!user,
    hasRole: (role: string) => user?.systemRoles?.includes(role) ?? false,
    hasCompanyId: (companyId: string) => {
      const cid = user?.company?._id || user?.company;
      return String(cid) === companyId;
    },
  };
}
