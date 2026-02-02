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
  maxApprovalAmount?: number;
  isActive: boolean;
  lastLogin?: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  systemRoles: string[];
  companyId?: string;
  departmentIds?: string[];
  officeIds?: string[];
  roleIds?: string[];
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
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'expired';
  subscriptionEndDate?: string;
  features: string[];
  logo?: string;
}

export interface CreateCompanyDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  subscriptionStatus?: 'active' | 'inactive' | 'suspended' | 'expired';
  features?: string[];
}

// Department Types
export interface Department extends BaseEntity {
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
  permissions: string[];
  isSystemRole?: boolean;
}

export interface CreateRoleDto {
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
  companyId: string;
  type: 'individual' | 'company';
  email?: string;
  phone?: string;
  address?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface CreateBeneficiaryDto {
  name: string;
  type: 'individual' | 'company';
  email?: string;
  phone?: string;
  address?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface UpdateBeneficiaryDto extends Partial<CreateBeneficiaryDto> {}

// Disbursement Types
export type DisbursementStatus =
  | 'draft'
  | 'pending'
  | 'approved_by_head'
  | 'approved_by_validator'
  | 'completed'
  | 'rejected'
  | 'cancelled';

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
  companyId: string;
  departmentId: string;
  officeId?: string;
  amount: number;
  currency: string;
  status: DisbursementStatus;
  typeId: string;
  type?: DisbursementType;
  beneficiaryId: string;
  beneficiary?: Beneficiary;
  description?: string;
  requestedBy: string;
  requester?: User;
  approvalSteps: ApprovalStep[];
  invoices?: string[];
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export interface CreateDisbursementDto {
  departmentId: string;
  officeId?: string;
  amount: number;
  currency?: string;
  typeId: string;
  beneficiaryId: string;
  description?: string;
  invoices?: string[];
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export interface UpdateDisbursementDto extends Partial<CreateDisbursementDto> {
  status?: DisbursementStatus;
}

export interface DisbursementFilters extends QueryParams, DateRange, AmountRange {
  status?: DisbursementStatus | DisbursementStatus[];
  departmentId?: string;
  officeId?: string;
  typeId?: string;
  beneficiaryId?: string;
  requestedBy?: string;
  tags?: string[];
}

// Disbursement Type Types
export interface DisbursementType extends BaseEntity {
  name: string;
  companyId: string;
  description?: string;
  requiresApproval?: boolean;
  approvalThreshold?: number;
}

export interface CreateDisbursementTypeDto {
  name: string;
  description?: string;
  requiresApproval?: boolean;
  approvalThreshold?: number;
}

export interface UpdateDisbursementTypeDto extends Partial<CreateDisbursementTypeDto> {}

// Collection Types
export type PaymentType = 'cash' | 'check' | 'transfer' | 'credit' | 'other';

export interface Collection extends BaseEntity {
  companyId: string;
  departmentId?: string;
  officeId?: string;
  sellerName: string;
  buyerName: string;
  amount: number;
  advancePayment: number;
  remainingBalance: number;
  currency: string;
  paymentType: PaymentType;
  productType: string;
  revenueCategory?: string;
  invoices?: string[];
  attachments?: string[];
  comment?: string;
  tags?: string[];
  collectedBy: string;
  collector?: User;
}

export interface CreateCollectionDto {
  departmentId?: string;
  officeId?: string;
  sellerName: string;
  buyerName: string;
  amount: number;
  advancePayment?: number;
  currency?: string;
  paymentType: PaymentType;
  productType: string;
  revenueCategory?: string;
  invoices?: string[];
  attachments?: string[];
  comment?: string;
  tags?: string[];
}

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {}

export interface CollectionFilters extends QueryParams, DateRange, AmountRange {
  paymentType?: PaymentType | PaymentType[];
  departmentId?: string;
  officeId?: string;
  productType?: string;
  revenueCategory?: string;
  collectedBy?: string;
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
  totalCollections: number;
  pendingApprovals: number;
  disbursementsByStatus: Record<string, number>;
  collectionsByPaymentType: Record<string, number>;
  monthlyTrends: {
    month: string;
    disbursements: number;
    collections: number;
  }[];
  topDepartments: {
    departmentId: string;
    departmentName: string;
    total: number;
  }[];
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
  companyId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  entityType?: string;
  entityId?: string;
}
