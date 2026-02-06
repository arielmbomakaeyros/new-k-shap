// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// Filter Types
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface AmountRange {
  minAmount?: number;
  maxAmount?: number;
}

// Common Entity Fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// User Types
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: any;
  isKaeyrosUser: boolean;
  roles: any[];
  systemRoles: string[];
  departments: any[];
  offices: any[];
  canLogin: boolean;
  mustChangePassword: boolean;
  avatar?: string;
  preferredLanguage: string;
  notificationPreferences?: {
    email?: boolean;
    inApp?: boolean;
    disbursementCreated?: boolean;
    disbursementValidated?: boolean;
    disbursementRejected?: boolean;
    disbursementCompleted?: boolean;
    chatMessages?: boolean;
    systemAlerts?: boolean;
  };
  maxApprovalAmount?: number;
  isActive: boolean;
  lastLogin?: string;
  _id?: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  systemRoles: string[];
  companyId?: string;
  departments?: string[];
  offices?: string[];
  roles?: string[];
  phone?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  canLogin?: boolean;
  isActive?: boolean;
  mustChangePassword?: boolean;
}

// Company Types
export interface Company extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  subscriptionStatus: 'active' | 'suspended' | 'trial' | 'expired' | 'deleted';
  subscriptionEndDate?: string;
  features: string[];
  logo?: string;
  baseFilePrefix?: string;
  filePrefixes?: string[];
  activeFilePrefix?: string;
}

export interface CreateCompanyDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  baseFilePrefix: string;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  subscriptionStatus?: 'active' | 'suspended' | 'trial' | 'expired' | 'deleted';
  features?: string[];
}

// Department Types
export interface Department extends BaseEntity {
  _id?: string;
  name: string;
  companyId: string;
  description?: string;
  headId?: string;
  head?: User;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  headId?: string;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

// Office Types
export interface Office extends BaseEntity {
  name: string;
  companyId: string;
  location: string;
  address?: string;
  phone?: string;
}

export interface CreateOfficeDto {
  name: string;
  location: string;
  address?: string;
  phone?: string;
}

export interface UpdateOfficeDto extends Partial<CreateOfficeDto> {}

// Role Types
export interface Role extends BaseEntity {
  name: string;
  companyId: string;
  description?: string;
  permissions: Array<string | Permission>;
  isSystemRole?: boolean;
  systemRoleType?: string;
}

export interface CreateRoleDto {
  _id?: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

// Permission Types
export interface Permission extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  category?: string;
}

// Beneficiary Types
export interface Beneficiary extends BaseEntity {
  name: string;
  type?: 'individual' | 'company' | 'supplier' | 'employee' | 'other';
  disbursementType?: string | DisbursementType;
  email?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  taxId?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateBeneficiaryDto {
  name: string;
  type?: 'individual' | 'company' | 'supplier' | 'employee' | 'other';
  disbursementType: string;
  email?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  taxId?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateBeneficiaryDto extends Partial<CreateBeneficiaryDto> {}

// Disbursement Types
export type DisbursementStatus =
  | 'draft'
  | 'pending_dept_head'
  | 'pending_validator'
  | 'pending_cashier'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type DisbursementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DisbursementPaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'card';

export interface ApprovalStep {
  id: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedAt?: string;
  comment?: string;
  isRequired: boolean;
}

export interface Disbursement extends BaseEntity {
  _id?: string;
  company: string | Company;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: DisbursementStatus;
  disbursementType: string | DisbursementType;
  beneficiary: string | Beneficiary;
  description: string;
  purpose?: string;
  department: string | Department;
  office?: string | Office | null;
  paymentMethod?: DisbursementPaymentMethod;
  expectedPaymentDate?: string;
  actualPaymentDate?: string;
  invoices?: string[];
  attachments?: string[];
  priority?: DisbursementPriority;
  deadline?: string;
  isUrgent?: boolean;
  isRetroactive?: boolean;
  tags?: string[];
  internalNotes?: string;
  actionHistory?: any[];
}

export interface CreateDisbursementDto {
  amount: number;
  currency?: string;
  disbursementType: string;
  beneficiary: string;
  description: string;
  purpose?: string;
  department: string;
  office?: string;
  paymentMethod?: DisbursementPaymentMethod;
  expectedPaymentDate?: string;
  invoices?: string[];
  attachments?: string[];
  priority?: DisbursementPriority;
  isUrgent?: boolean;
  isRetroactive?: boolean;
  tags?: string[];
  internalNotes?: string;
}

export interface UpdateDisbursementDto extends Partial<CreateDisbursementDto> {
  status?: DisbursementStatus;
}

export interface DisbursementFilters extends QueryParams, DateRange, AmountRange {
  status?: DisbursementStatus | DisbursementStatus[];
  department?: string;
  office?: string;
  disbursementType?: string;
  beneficiary?: string;
  paymentMethod?: DisbursementPaymentMethod;
  priority?: DisbursementPriority;
  isUrgent?: boolean;
  isRetroactive?: boolean;
  isCompleted?: boolean;
  tags?: string[];
}

// Disbursement Type Types
export interface DisbursementType extends BaseEntity {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateDisbursementTypeDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDisbursementTypeDto extends Partial<CreateDisbursementTypeDto> {}

// Payment Method Types
export interface PaymentMethod extends BaseEntity {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface CreatePaymentMethodDto {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface UpdatePaymentMethodDto extends Partial<CreatePaymentMethodDto> {}

// Collection Types
export type PaymentType = 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'card';

export interface Collection extends BaseEntity {
  company: string | Company;
  department?: string | Department;
  office?: string | Office;
  sellerName?: string;
  buyerName: string;
  buyerCompanyName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  productType?: string;
  serviceCategory?: string;
  totalAmountDue?: number;
  advancePayment?: number;
  remainingBalance?: number;
  isFullyPaid?: boolean;
  invoices?: string[];
  attachments?: string[];
  comment?: string;
  internalNotes?: string;
  tags?: string[];
  handledBy?: string | User;
}

export interface CreateCollectionDto {
  amount: number;
  currency?: string;
  buyerName: string;
  buyerCompanyName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  sellerName?: string;
  handledBy?: string;
  paymentType: PaymentType;
  productType?: string;
  serviceCategory?: string;
  totalAmountDue?: number;
  advancePayment?: number;
  remainingBalance?: number;
  department?: string;
  office?: string;
  invoices?: string[];
  attachments?: string[];
  comment?: string;
  internalNotes?: string;
  tags?: string[];
}

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {}

export interface CollectionFilters extends QueryParams, DateRange, AmountRange {
  paymentType?: PaymentType | PaymentType[];
  department?: string;
  office?: string;
  productType?: string;
  serviceCategory?: string;
  handledBy?: string;
  tags?: string[];
}

// Notification Types
export type NotificationType =
  | 'disbursement_pending'
  | 'disbursement_approved'
  | 'disbursement_rejected'
  | 'collection_added'
  | 'permission_changed'
  | 'user_added'
  | 'system_alert';

export interface Notification extends BaseEntity {
  userId: string;
  companyId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: string;
  read: boolean;
  readAt?: string;
}

// Audit Log Types
export interface AuditLog extends BaseEntity {
  userId: string;
  user?: User;
  companyId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters extends QueryParams, DateRange {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
}

// Settings Types
export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
  enableTls: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  pendingDisbursementReminder: boolean;
  pendingDisbursementDays: number;
  approvalReminderEnabled: boolean;
  approvalReminderHours: number;
}

// Company Settings Types
export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
}

export interface WorkflowSettings {
  requireDeptHeadApproval: boolean;
  requireValidatorApproval: boolean;
  requireCashierExecution: boolean;
  maxAmountNoApproval: number;
}

export interface EmailNotificationSettings {
  onNewDisbursement: boolean;
  onDisbursementApproved: boolean;
  onDisbursementRejected: boolean;
  onCollectionAdded: boolean;
  dailySummary: boolean;
}

export interface CompanySettings {
  companyInfo: CompanyInfo;
  paymentMethods?: string[];
  defaultCurrency?: string;
  branding?: {
    logoUrl: string;
    primaryColor: string;
  };
  baseFilePrefix?: string;
  filePrefixes?: string[];
  activeFilePrefix?: string;
  supportedLanguages?: string[];
  defaultLanguage?: string;
  notificationChannels?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  payoutSchedule?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfMonth?: number;
    dayOfWeek?: string;
  };
  approvalLimitsByRole?: Record<string, number>;
  officeSpendCaps?: Record<string, number>;
  defaultBeneficiaries?: string[];
  workflowSettings: WorkflowSettings;
  emailNotificationSettings: EmailNotificationSettings;
}

// Export Types
export interface Export extends BaseEntity {
  companyId: string;
  userId: string;
  type: 'disbursements' | 'collections' | 'users' | 'audit_logs';
  format: 'csv' | 'pdf' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filters?: Record<string, unknown>;
  fileUrl?: string;
  fileName?: string;
  errorMessage?: string;
}

export interface CreateExportDto {
  type: 'disbursements' | 'collections' | 'users' | 'audit_logs';
  format: 'csv' | 'pdf' | 'xlsx';
  filters?: Record<string, unknown>;
}

// Report Types
export interface DashboardReport {
  totalDisbursements: number;
  totalCollectionsAmount: number;
  pendingApprovals: number;
  totalUsers: number;
}

export interface DisbursementSummary {
  totalCount: number;
  totalAmount: number;
  byStatus: Record<string, { count: number; amount: number }>;
  byDepartment: Record<string, { count: number; amount: number }>;
  byType: Record<string, { count: number; amount: number }>;
  trends: {
    period: string;
    count: number;
    amount: number;
  }[];
}

export interface CollectionSummary {
  totalCount: number;
  totalAmount: number;
  byPaymentType: Record<string, { count: number; amount: number }>;
  byDepartment: Record<string, { count: number; amount: number }>;
  byRevenueCategory: Record<string, { count: number; amount: number }>;
  trends: {
    period: string;
    count: number;
    amount: number;
  }[];
}

// File Upload Types
export interface FileUpload extends BaseEntity {
  companyId?: string;
  userId?: string;
  filename?: string;
  originalName: string;
  mimeType: string;
  size: number;
  path?: string;
  url: string;
  category?: string;
  entityType?: string;
  entityId?: string;
}

// Disbursement Template Types
export interface DisbursementTemplate extends BaseEntity {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  disbursementType: any;
  beneficiary: any;
  department: any;
  office?: any;
  paymentMethod?: string;
  purpose?: string;
  priority?: string;
  isUrgent?: boolean;
  tags?: string[];
  isActive?: boolean;
}

export interface CreateDisbursementTemplateDto {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  disbursementType: string;
  beneficiary: string;
  department: string;
  office?: string;
  paymentMethod?: string;
  purpose?: string;
  priority?: string;
  isUrgent?: boolean;
  tags?: string[];
}

export interface UpdateDisbursementTemplateDto extends Partial<CreateDisbursementTemplateDto> {}

// Platform Settings Types
export interface PlatformSettings extends BaseEntity {
  emailConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    fromEmail: string;
  };
  notifications: {
    sendErrorAlerts: boolean;
    dailyActivitySummary: boolean;
    suspiciousLoginAlerts: boolean;
    subscriptionReminders: boolean;
  };
  subscriptionPlans: Array<{
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    maxUsers: number;
    features: string[];
  }>;
  apiConfig: {
    apiBaseUrl: string;
    rateLimitingEnabled: boolean;
    rateLimit: number;
  };
  branding: {
    primaryColor: string;
    logoUrl: string;
  };
  slaThresholds?: {
    deptHeadHours: number;
    validatorHours: number;
    cashierHours: number;
  };
  auditLogRetentionDays?: number;
  defaultWorkflowTemplate?: {
    name: string;
    stages: string[];
  };
  billingGracePeriodDays?: number;
  webhookSettings?: {
    enabled: boolean;
    url: string;
    secret: string;
  };
  emailDomainsAllowlist?: string[];
  featureFlagsByPlan?: Record<string, Record<string, boolean>>;
}

// Kaeyros Platform Stats Types
export interface PlatformStats {
  totals: {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    totalDisbursements: number;
    totalCollections: number;
    disbursementAmount: number;
    collectionAmount: number;
  };
  trends: {
    disbursementChange: number;
    collectionChange: number;
    newCompaniesChange: number;
    newUsersChange: number;
  };
  topCompanies: Array<{
    companyId: string;
    name: string;
    disbursementsTotal: number;
    disbursementsCount: number;
  }>;
  monthly?: Array<{
    month: string;
    disbursements: number;
    collections: number;
    newCompanies: number;
    newUsers: number;
  }>;
}
