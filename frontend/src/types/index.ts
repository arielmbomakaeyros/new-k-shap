// User & Auth Types — aligned with backend enums.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: any;
  isKaeyrosUser: boolean;
  roles: any[];
  systemRoles: UserRole[];
  departments: any[];
  offices: any[];
  canLogin: boolean;
  mustChangePassword: boolean;
  avatar?: string;
  preferredLanguage: string;
  maxApprovalAmount?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  // Platform Owner Roles
  KaeyrosSuperAdmin = 'kaeyros_super_admin',
  KaeyrosAdmin = 'kaeyros_admin',
  KaeyrosSupport = 'kaeyros_support',
  // Company Roles
  CompanySuperAdmin = 'company_super_admin',
  Validator = 'validator',
  DepartmentHead = 'department_head',
  Cashier = 'cashier',
  Agent = 'agent',
  Accountant = 'accountant',
  CustomRole = 'custom_role',
}

// Company & Organization Types
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate?: Date;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Expired = 'expired',
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
  description?: string;
  headId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Office {
  id: string;
  name: string;
  companyId: string;
  location: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Disbursement Types
export interface Disbursement {
  id: string;
  companyId: string;
  departmentId: string;
  amount: number;
  currency: string;
  status: DisbursementStatus;
  typeId: string;
  beneficiary: string;
  description?: string;
  requestedBy: string;
  approvalSteps: ApprovalStep[];
  approvals?: Approval[]; // For workflow timeline
  invoices?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Approval {
  approver_name: string;
  stage: string;
  notes?: string;
  approved_at: string;
  action: 'approved' | 'rejected';
}

export enum DisbursementStatus {
  Draft = 'draft',
  Pending = 'pending',
  ApprovedByHead = 'approved_by_head',
  ApprovedByValidator = 'approved_by_validator',
  Completed = 'completed',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

export interface ApprovalStep {
  id: string;
  role: UserRole;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  comment?: string;
  isRequired: boolean;
}

export enum ApprovalStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Skipped = 'skipped',
}

export interface DisbursementType {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Collection/Cash Inflow Types
export interface Collection {
  id: string;
  companyId: string;
  sellerName: string;
  buyerName: string;
  amount: number;
  advancePayment: number;
  remainingBalance: number;
  currency: string;
  paymentType: PaymentType;
  productType: string;
  invoices?: string[];
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentType {
  Cash = 'cash',
  Check = 'check',
  Transfer = 'transfer',
  Credit = 'credit',
  Other = 'other',
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  companyId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: string;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  DisbursementPending = 'disbursement_pending',
  DisbursementApproved = 'disbursement_approved',
  DisbursementRejected = 'disbursement_rejected',
  CollectionAdded = 'collection_added',
  PermissionChanged = 'permission_changed',
  UserAdded = 'user_added',
  SystemAlert = 'system_alert',
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
