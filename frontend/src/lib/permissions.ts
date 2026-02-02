// Permission definitions for K-shap
// These match the backend PermissionResource:PermissionAction pattern
export const PERMISSIONS = {
  // Dashboard & Basic Access
  'dashboard:view': 'View dashboard',
  'dashboard:export': 'Export dashboard data',

  // Disbursements
  'disbursement:view': 'View disbursements',
  'disbursement:create': 'Create disbursement requests',
  'disbursement:edit': 'Edit own disbursements',
  'disbursement:delete': 'Delete disbursements',
  'disbursement:approve_department': 'Approve as department head',
  'disbursement:approve_validate': 'Approve as validator',
  'disbursement:approve_cashier': 'Process disbursements',
  'disbursement:export': 'Export disbursements',

  // Collections
  'collection:view': 'View collections',
  'collection:create': 'Record collections',
  'collection:edit': 'Edit collections',
  'collection:delete': 'Delete collections',
  'collection:reconcile': 'Perform bank reconciliation',
  'collection:export': 'Export collections',

  // Company Management
  'company:view': 'View company details',
  'company:edit': 'Edit company settings',
  'company:manage_users': 'Manage company users',
  'company:manage_departments': 'Manage departments',
  'company:manage_offices': 'Manage offices',
  'company:manage_roles': 'Define custom roles',

  // User Management
  'user:view': 'View user list',
  'user:create': 'Invite new users',
  'user:edit': 'Edit user details',
  'user:delete': 'Remove users',
  'user:manage_roles': 'Assign roles',

  // Analytics & Reports
  'analytics:view': 'View analytics',
  'analytics:export': 'Export analytics reports',
  'analytics:advanced': 'Access advanced analytics',

  // Settings
  'settings:view': 'View settings',
  'settings:edit': 'Edit settings',
  'settings:manage_integrations': 'Manage integrations',
  'settings:manage_notifications': 'Manage notifications',

  // Admin Functions (Kaeyros platform-level)
  'admin:view': 'View admin panel',
  'admin:manage_companies': 'Manage companies',
  'admin:manage_subscriptions': 'Manage subscriptions',
  'admin:manage_users': 'Manage platform users',
  'admin:view_logs': 'View system logs',
  'admin:manage_settings': 'Manage platform settings',

  // Audit & Compliance
  'audit:view_logs': 'View audit logs',
  'audit:export': 'Export audit reports',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// All permission values as an array (for "full access" roles)
const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

// Role Definitions with default permissions
// Keys match backend UserRole enum values from enums.ts
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // ── Kaeyros Platform Roles ──
  kaeyros_super_admin: ALL_PERMISSIONS,

  kaeyros_admin: [
    'dashboard:view',
    'dashboard:export',
    'admin:view',
    'admin:manage_companies',
    'admin:manage_subscriptions',
    'admin:manage_users',
    'admin:view_logs',
    'admin:manage_settings',
    'company:view',
    'user:view',
    'analytics:view',
    'analytics:export',
    'analytics:advanced',
    'audit:view_logs',
    'audit:export',
  ],

  kaeyros_support: [
    'dashboard:view',
    'admin:view',
    'admin:view_logs',
    'company:view',
    'user:view',
    'disbursement:view',
    'collection:view',
    'analytics:view',
    'audit:view_logs',
  ],

  // ── Company Roles ──
  company_super_admin: [
    'dashboard:view',
    'dashboard:export',
    'disbursement:view',
    'disbursement:create',
    'disbursement:edit',
    'disbursement:delete',
    'disbursement:approve_department',
    'disbursement:approve_validate',
    'disbursement:approve_cashier',
    'disbursement:export',
    'collection:view',
    'collection:create',
    'collection:edit',
    'collection:delete',
    'collection:reconcile',
    'collection:export',
    'company:view',
    'company:edit',
    'company:manage_users',
    'company:manage_departments',
    'company:manage_offices',
    'company:manage_roles',
    'user:view',
    'user:create',
    'user:edit',
    'user:delete',
    'user:manage_roles',
    'analytics:view',
    'analytics:export',
    'analytics:advanced',
    'settings:view',
    'settings:edit',
    'settings:manage_integrations',
    'settings:manage_notifications',
    'audit:view_logs',
    'audit:export',
  ],

  department_head: [
    'dashboard:view',
    'disbursement:view',
    'disbursement:create',
    'disbursement:edit',
    'disbursement:approve_department',
    'disbursement:export',
    'collection:view',
    'collection:create',
    'analytics:view',
    'user:view',
    'audit:view_logs',
  ],

  validator: [
    'dashboard:view',
    'disbursement:view',
    'disbursement:approve_validate',
    'disbursement:export',
    'collection:view',
    'collection:reconcile',
    'analytics:view',
    'audit:view_logs',
  ],

  cashier: [
    'dashboard:view',
    'disbursement:view',
    'disbursement:approve_cashier',
    'disbursement:export',
    'collection:view',
    'collection:edit',
    'collection:export',
    'analytics:view',
    'audit:view_logs',
  ],

  accountant: [
    'dashboard:view',
    'dashboard:export',
    'disbursement:view',
    'disbursement:export',
    'collection:view',
    'collection:create',
    'collection:edit',
    'collection:export',
    'collection:reconcile',
    'analytics:view',
    'analytics:export',
    'analytics:advanced',
    'audit:view_logs',
  ],

  agent: [
    'dashboard:view',
    'disbursement:view',
    'disbursement:create',
    'collection:view',
    'analytics:view',
  ],
};

// Role hierarchy for default inheritance
export const ROLE_HIERARCHY: Record<string, string[]> = {
  kaeyros_super_admin: [],
  kaeyros_admin: [],
  kaeyros_support: [],
  company_super_admin: [],
  department_head: ['agent'],
  validator: ['agent'],
  cashier: ['agent'],
  accountant: ['agent'],
  agent: [],
};

// Role metadata
export const ROLE_METADATA: Record<
  string,
  { label: string; description: string; scope: 'platform' | 'company' | 'department' }
> = {
  kaeyros_super_admin: {
    label: 'Kaeyros Super Admin',
    description: 'Full platform access and control',
    scope: 'platform',
  },
  kaeyros_admin: {
    label: 'Kaeyros Admin',
    description: 'Platform administration with restricted permissions',
    scope: 'platform',
  },
  kaeyros_support: {
    label: 'Kaeyros Support',
    description: 'Support staff for troubleshooting',
    scope: 'platform',
  },
  company_super_admin: {
    label: 'Company Admin',
    description: 'Full company access and control',
    scope: 'company',
  },
  department_head: {
    label: 'Department Head',
    description: 'Department management and approval authority',
    scope: 'department',
  },
  validator: {
    label: 'Validator',
    description: 'Financial validation and approval',
    scope: 'company',
  },
  cashier: {
    label: 'Cashier',
    description: 'Payment processing and execution',
    scope: 'company',
  },
  accountant: {
    label: 'Accountant',
    description: 'Financial oversight and analytics',
    scope: 'company',
  },
  agent: {
    label: 'Agent',
    description: 'Basic access for standard operations',
    scope: 'company',
  },
};

// Helper: all Kaeyros platform role keys
export const KAEYROS_ROLES = ['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support'];

// Helper: all company role keys
export const COMPANY_ROLES = [
  'company_super_admin',
  'department_head',
  'validator',
  'cashier',
  'accountant',
  'agent',
];
