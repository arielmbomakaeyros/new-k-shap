// Export query keys
export { queryKeys } from './keys';

// Auth hooks
export {
  useProfile,
  useLogin,
  useLogout,
  useChangePassword,
  useSetPassword,
  useForgotPassword,
  useResetPassword,
  useUpdateProfile,
  useUpdateProfileAvatar,
} from './useAuth';

// Users hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRestoreUser,
  useResendActivation,
  useUpdateUserPermissions,
  useToggleUserActive,
} from './useUsers';

// Companies hooks
export {
  useCompanies,
  useCompany,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from './useCompanies';

// Departments hooks
export {
  useDepartments,
  useDepartment,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from './useDepartments';

// Offices hooks
export {
  useOffices,
  useOffice,
  useCreateOffice,
  useUpdateOffice,
  useDeleteOffice,
} from './useOffices';

// Roles hooks
export {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from './useRoles';

// Disbursements hooks
export {
  useDisbursements,
  useDisbursement,
  usePendingDisbursements,
  useCreateDisbursement,
  useUpdateDisbursement,
  useDeleteDisbursement,
  useApproveDisbursement,
  useRejectDisbursement,
  useCancelDisbursement,
  useForceCompleteDisbursement,
} from './useDisbursements';

// Collections hooks
export {
  useCollections,
  useCollection,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from './useCollections';

// Notifications hooks
export {
  useNotifications,
  useUnreadNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from './useNotifications';

// Reports hooks
export {
  useDashboardReport,
  useDisbursementsSummary,
  useCollectionsSummary,
} from './useReports';

// Permissions hooks
export {
  usePermissions,
  usePermission,
  usePermissionsGrouped,
} from './usePermissions';

// Settings hooks
export {
  useCompanySettings,
  useUpdateCompanyInfo,
  useUpdateWorkflowSettings,
  useUpdateEmailNotificationSettings,
} from './useSettings';

export * from './useBeneficiaries';
export * from './useDisbursementTypes';

export * from './useDisbursementTemplates';
export * from './usePlatformSettings';
export * from './useKaeyros';
