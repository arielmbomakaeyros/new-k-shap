import { ROLE_PERMISSIONS, KAEYROS_ROLES, type Permission } from './permissions';
import type { User } from '../store/authStore';

/**
 * Get the union of all permissions for a user's systemRoles
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user || !user.systemRoles) return [];

  const permissionSet = new Set<Permission>();
  for (const role of user.systemRoles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms) {
      perms.forEach((p) => permissionSet.add(p));
    }
  }
  return Array.from(permissionSet);
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  return getUserPermissions(user).includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const userPerms = getUserPermissions(user);
  return permissions.some((p) => userPerms.includes(p));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const userPerms = getUserPermissions(user);
  return permissions.every((p) => userPerms.includes(p));
}

/**
 * Check if a role can perform an action
 */
export function roleCanAccess(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Get all roles that have a specific permission
 */
export function getRolesWithPermission(permission: Permission): string[] {
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([_, permissions]) => permissions.includes(permission))
    .map(([role]) => role);
}

/**
 * Check if user has any admin-level role (Kaeyros platform or company super admin)
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.systemRoles) return false;
  const adminRoles = [...KAEYROS_ROLES, 'company_super_admin'];
  return user.systemRoles.some((r) => adminRoles.includes(r));
}

/**
 * Check if user is a Kaeyros platform user
 */
export function isKaeyrosUser(user: User | null): boolean {
  if (!user) return false;
  return !!user.isKaeyrosUser;
}

/**
 * Check if user has a finance-related role
 */
export function isFinanceRole(user: User | null): boolean {
  if (!user || !user.systemRoles) return false;
  return user.systemRoles.some((r) =>
    ['validator', 'cashier', 'accountant'].includes(r)
  );
}

/**
 * Check if user has an approval authority role
 */
export function isApprover(user: User | null, stage?: string): boolean {
  if (!user || !user.systemRoles) return false;
  const roles = user.systemRoles;

  if (stage === 'department_head') {
    return roles.some((r) =>
      ['department_head', 'company_super_admin', ...KAEYROS_ROLES].includes(r)
    );
  }

  if (stage === 'validator') {
    return roles.some((r) =>
      ['validator', 'accountant', 'company_super_admin', ...KAEYROS_ROLES].includes(r)
    );
  }

  if (stage === 'cashier') {
    return roles.some((r) =>
      ['cashier', 'accountant', 'company_super_admin', ...KAEYROS_ROLES].includes(r)
    );
  }

  // General approver check
  return roles.some((r) =>
    ['department_head', 'validator', 'cashier', 'company_super_admin', ...KAEYROS_ROLES].includes(r)
  );
}

/**
 * Filter items based on user's view permissions (multi-tenant isolation)
 */
export function filterAccessibleItems<T extends { company_id?: string }>(
  items: T[],
  user: User | null,
  _permission: Permission
): T[] {
  if (!user) return [];

  // Kaeyros users can see everything
  if (user.isKaeyrosUser) return items;

  // Company users can only see their company's items
  const companyId = user.company?._id || user.company;
  if (companyId) {
    return items.filter((item) => !item.company_id || item.company_id === String(companyId));
  }

  return items;
}

/**
 * Check resource ownership
 */
export function isResourceOwner(
  user: User | null,
  resource: { created_by?: string; company_id?: string }
): boolean {
  if (!user) return false;

  // Kaeyros super admin owns everything
  if (user.isKaeyrosUser) return true;

  // Check company ownership
  const companyId = user.company?._id || user.company;
  if (resource.company_id && String(companyId) !== resource.company_id) return false;

  // Check creator ownership
  if (resource.created_by && resource.created_by !== user.id) {
    return false;
  }

  return true;
}

/**
 * Get permission description
 */
export function getPermissionDescription(permission: Permission): string {
  const descriptions: Record<Permission, string> = {
    'dashboard:view': 'View dashboard',
    'dashboard:export': 'Export dashboard data',
    'disbursement:view': 'View disbursements',
    'disbursement:create': 'Create disbursement requests',
    'disbursement:edit': 'Edit own disbursements',
    'disbursement:delete': 'Delete disbursements',
    'disbursement:approve_department': 'Approve as department head',
    'disbursement:approve_validate': 'Approve as validator',
    'disbursement:approve_cashier': 'Process disbursements',
    'disbursement:export': 'Export disbursements',
    'collection:view': 'View collections',
    'collection:create': 'Record collections',
    'collection:edit': 'Edit collections',
    'collection:delete': 'Delete collections',
    'collection:reconcile': 'Perform bank reconciliation',
    'collection:export': 'Export collections',
    'company:view': 'View company details',
    'company:edit': 'Edit company settings',
    'company:manage_users': 'Manage company users',
    'company:manage_departments': 'Manage departments',
    'company:manage_offices': 'Manage offices',
    'company:manage_roles': 'Define custom roles',
    'user:view': 'View user list',
    'user:create': 'Invite new users',
    'user:edit': 'Edit user details',
    'user:delete': 'Remove users',
    'user:manage_roles': 'Assign roles',
    'analytics:view': 'View analytics',
    'analytics:export': 'Export analytics reports',
    'analytics:advanced': 'Access advanced analytics',
    'settings:view': 'View settings',
    'settings:edit': 'Edit settings',
    'settings:manage_integrations': 'Manage integrations',
    'settings:manage_notifications': 'Manage notifications',
    'admin:view': 'View admin panel',
    'admin:manage_companies': 'Manage companies',
    'admin:manage_subscriptions': 'Manage subscriptions',
    'admin:manage_users': 'Manage platform users',
    'admin:view_logs': 'View system logs',
    'admin:manage_settings': 'Manage platform settings',
    'audit:view_logs': 'View audit logs',
    'audit:export': 'Export audit reports',
  };

  return descriptions[permission] || permission;
}
