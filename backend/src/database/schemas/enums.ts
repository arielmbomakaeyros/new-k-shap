// ==================== ENUMS ====================

export enum UserRole {
  // Platform Owner Roles
  KAEYROS_SUPER_ADMIN = 'kaeyros_super_admin',
  KAEYROS_ADMIN = 'kaeyros_admin',
  KAEYROS_SUPPORT = 'kaeyros_support',

  // Company Roles
  COMPANY_SUPER_ADMIN = 'company_super_admin',
  VALIDATOR = 'validator',
  DEPARTMENT_HEAD = 'department_head',
  CASHIER = 'cashier',
  AGENT = 'agent',
  ACCOUNTANT = 'accountant',
  CUSTOM_ROLE = 'custom_role',
}

export enum CompanyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export enum DisbursementStatus {
  DRAFT = 'draft',
  PENDING_DEPT_HEAD = 'pending_dept_head',
  PENDING_VALIDATOR = 'pending_validator',
  PENDING_CASHIER = 'pending_cashier',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ActionType {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DEACTIVATED = 'user_deactivated',
  USER_DELETED = 'user_deleted',
  USER_RESTORED = 'user_restored',

  // Disbursement Actions
  DISBURSEMENT_CREATED = 'disbursement_created',
  DISBURSEMENT_UPDATED = 'disbursement_updated',
  DEPT_HEAD_VALIDATED = 'dept_head_validated',
  DEPT_HEAD_REJECTED = 'dept_head_rejected',
  VALIDATOR_APPROVED = 'validator_approved',
  VALIDATOR_REJECTED = 'validator_rejected',
  CASHIER_EXECUTED = 'cashier_executed',
  DISBURSEMENT_FORCE_COMPLETED = 'disbursement_force_completed',
  DISBURSEMENT_CANCELLED = 'disbursement_cancelled',
  DISBURSEMENT_DELETED = 'disbursement_deleted',

  // Collection Actions
  COLLECTION_CREATED = 'collection_created',
  COLLECTION_UPDATED = 'collection_updated',
  COLLECTION_DELETED = 'collection_deleted',

  // Settings
  SETTINGS_UPDATED = 'settings_updated',
  ROLE_CREATED = 'role_created',
  PERMISSION_UPDATED = 'permission_updated',
  DEPARTMENT_CREATED = 'department_created',

  // Company Management (Kaeyros only)
  COMPANY_CREATED = 'company_created',
  COMPANY_SUSPENDED = 'company_suspended',
  COMPANY_ACTIVATED = 'company_activated',
  COMPANY_FEATURE_TOGGLED = 'company_feature_toggled',
  COMPANY_DATA_RESTORED = 'company_data_restored',
  COMPANY_DATA_PERMANENTLY_DELETED = 'company_data_permanently_deleted',

  // Chat
  CHAT_MESSAGE_SENT = 'chat_message_sent',
  CHAT_MESSAGE_REPLIED = 'chat_message_replied',

  // Export
  DATA_EXPORTED = 'data_exported',
}

export enum PaymentType {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CHECK = 'check',
  CARD = 'card',
}

export enum PermissionResource {
  DISBURSEMENT = 'disbursement',
  COLLECTION = 'collection',
  DEPARTMENT = 'department',
  OFFICE = 'office',
  DISBURSEMENT_TYPE = 'disbursement_type',
  BENEFICIARY = 'beneficiary',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  REPORT = 'report',
  EXPORT = 'export',
  AUDIT_LOG = 'audit_log',
  CHAT = 'chat',
  NOTIFICATION = 'notification',
  COMPANY_SETTINGS = 'company_settings',
  EMAIL_SETTINGS = 'email_settings',
  REMINDER_SETTINGS = 'reminder_settings',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  VALIDATE = 'validate',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  FORCE_COMPLETE = 'force_complete',
  RESTORE = 'restore',
}

export enum DisbursementActionType {
  CREATED = 'created',
  UPDATED = 'updated',
  DEPT_HEAD_VALIDATED = 'dept_head_validated',
  DEPT_HEAD_VALIDATION_UNDONE = 'dept_head_validation_undone',
  VALIDATOR_APPROVED = 'validator_approved',
  VALIDATOR_APPROVAL_UNDONE = 'validator_approval_undone',
  CASHIER_EXECUTED = 'cashier_executed',
  CASHIER_EXECUTION_UNDONE = 'cashier_execution_undone',
  REJECTED = 'rejected',
  REJECTION_UNDONE = 'rejection_undone',
  FORCE_COMPLETED = 'force_completed',
  FORCE_COMPLETION_UNDONE = 'force_completion_undone',
  STATUS_REVERTED = 'status_reverted',
  COMMENT_ADDED = 'comment_added',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_DELETED = 'document_deleted',
}
