import type { QueryParams } from '@/services/types';

/**
 * Query Keys Factory
 *
 * Centralized query key management for React Query cache invalidation.
 * Following the pattern recommended by TanStack Query documentation.
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.companies.details(), id] as const,
  },

  // Departments
  departments: {
    all: ['departments'] as const,
    lists: () => [...queryKeys.departments.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.departments.lists(), filters] as const,
    details: () => [...queryKeys.departments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.departments.details(), id] as const,
  },

  // Offices
  offices: {
    all: ['offices'] as const,
    lists: () => [...queryKeys.offices.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.offices.lists(), filters] as const,
    details: () => [...queryKeys.offices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.offices.details(), id] as const,
  },

  // Roles
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },

  // Permissions
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...queryKeys.permissions.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.permissions.lists(), filters] as const,
    grouped: () => [...queryKeys.permissions.all, 'grouped'] as const,
  },

  // Beneficiaries
  beneficiaries: {
    all: ['beneficiaries'] as const,
    lists: () => [...queryKeys.beneficiaries.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.beneficiaries.lists(), filters] as const,
    details: () => [...queryKeys.beneficiaries.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.beneficiaries.details(), id] as const,
  },

  // Disbursements
  disbursements: {
    all: ['disbursements'] as const,
    lists: () => [...queryKeys.disbursements.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.disbursements.lists(), filters] as const,
    details: () => [...queryKeys.disbursements.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.disbursements.details(), id] as const,
    pending: () => [...queryKeys.disbursements.all, 'pending'] as const,
    my: () => [...queryKeys.disbursements.all, 'my'] as const,
  },

  // Disbursement Types
  disbursementTypes: {
    all: ['disbursement-types'] as const,
    lists: () => [...queryKeys.disbursementTypes.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.disbursementTypes.lists(), filters] as const,
    details: () => [...queryKeys.disbursementTypes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.disbursementTypes.details(), id] as const,
  },

  // Payment Methods
  paymentMethods: {
    all: ['payment-methods'] as const,
    lists: () => [...queryKeys.paymentMethods.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.paymentMethods.lists(), filters] as const,
    details: () => [...queryKeys.paymentMethods.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.paymentMethods.details(), id] as const,
  },


  // Disbursement Templates
  disbursementTemplates: {
    all: ['disbursement-templates'] as const,
    lists: () => [...queryKeys.disbursementTemplates.all, 'list'] as const,
    list: () => [...queryKeys.disbursementTemplates.lists()] as const,
    details: () => [...queryKeys.disbursementTemplates.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.disbursementTemplates.details(), id] as const,
  },

  // Collections
  collections: {
    all: ['collections'] as const,
    lists: () => [...queryKeys.collections.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.collections.lists(), filters] as const,
    details: () => [...queryKeys.collections.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.collections.details(), id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  // Audit Logs
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.auditLogs.lists(), filters] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    company: () => [...queryKeys.settings.all, 'company'] as const,
    email: () => [...queryKeys.settings.all, 'email'] as const,
    reminders: () => [...queryKeys.settings.all, 'reminders'] as const,
    key: (key: string) => [...queryKeys.settings.all, key] as const,
  },

  // Exports
  exports: {
    all: ['exports'] as const,
    lists: () => [...queryKeys.exports.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.exports.lists(), filters] as const,
    details: () => [...queryKeys.exports.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exports.details(), id] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    dashboard: (filters?: QueryParams) => [...queryKeys.reports.all, 'dashboard', filters] as const,
    disbursementsSummary: (filters?: QueryParams) =>
      [...queryKeys.reports.all, 'disbursements-summary', filters] as const,
    collectionsSummary: (filters?: QueryParams) =>
      [...queryKeys.reports.all, 'collections-summary', filters] as const,
  },

  // Chat
  chat: {
    all: () => ['chat'] as const,
    participants: () => ['chat', 'participants'] as const,
  },

  // File Uploads
  fileUploads: {
    all: ['file-uploads'] as const,
    lists: () => [...queryKeys.fileUploads.all, 'list'] as const,
    list: (filters?: QueryParams) => [...queryKeys.fileUploads.lists(), filters] as const,
    details: () => [...queryKeys.fileUploads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.fileUploads.details(), id] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
