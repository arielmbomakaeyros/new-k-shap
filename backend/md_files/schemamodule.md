import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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
  CUSTOM_ROLE = 'custom_role', // For company-defined roles
}

export enum CompanyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  DELETED = 'deleted', // Soft delete - 30 day grace period
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
  DISBURSEMENT_FORCE_COMPLETED = 'disbursement_force_completed', // Super admin bypass
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

// ==================== BASE SCHEMA WITH SOFT DELETE ====================

@Schema()
export class BaseEntity extends Document {
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  permanentDeleteScheduledFor: Date; // deletedAt + 30 days

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  updatedBy: MongooseSchema.Types.ObjectId;
}

// ==================== COMPANY SCHEMA ====================

@Schema({ timestamps: true })
export class Company extends BaseEntity {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string; // URL-friendly identifier

  @Prop({ trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ type: String, enum: CompanyStatus, default: CompanyStatus.TRIAL })
  status: CompanyStatus;

  @Prop({ type: Date })
  subscriptionStartDate: Date;

  @Prop({ type: Date })
  subscriptionEndDate: Date;

  @Prop({ type: Date })
  trialEndDate: Date;

  // Feature toggles (Kaeyros can enable/disable features)
  @Prop({ type: Object, default: {} })
  enabledFeatures: {
    disbursements: boolean;
    collections: boolean;
    chat: boolean;
    notifications: boolean;
    emailNotifications: boolean;
    reports: boolean;
    multiCurrency: boolean;
    apiAccess: boolean;
  };

  // Subscription plan details
  @Prop({ type: String })
  planType: string; // 'basic', 'premium', 'enterprise'

  @Prop({ type: Number, default: 0 })
  maxUsers: number;

  @Prop({ type: Number, default: 0 })
  currentUserCount: number;

  // Company settings
  @Prop({ type: String, default: 'XAF' })
  defaultCurrency: string;

  @Prop({ type: String, default: 'Africa/Douala' })
  timezone: string;

  @Prop({ type: [String], default: ['fr', 'en'] })
  supportedLanguages: string[];

  @Prop({ type: String, default: 'fr' })
  defaultLanguage: string;

  // Logo and branding
  @Prop({ type: String })
  logoUrl: string;

  @Prop({ type: String })
  primaryColor: string;

  // Kaeyros metadata
  @Prop({ type: String })
  notes: string; // Internal notes for Kaeyros team

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  kaeyrosAccountManager: MongooseSchema.Types.ObjectId; // Assigned Kaeyros support
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// ==================== USER SCHEMA ====================

@Schema({ timestamps: true })
export class User extends BaseEntity {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string; // Hashed

  @Prop({ type: String, trim: true })
  phone: string;

  // Multi-tenancy
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId; // null for Kaeyros users

  @Prop({ type: Boolean, default: false })
  isKaeyrosUser: boolean; // Platform owner users

  // Role and permissions
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }], default: [] })
  roles: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [String], enum: UserRole, default: [] })
  systemRoles: UserRole[]; // Predefined system roles

  // User can have multiple departments/offices
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Department' }], default: [] })
  departments: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Office' }], default: [] })
  offices: MongooseSchema.Types.ObjectId[];

  // Authentication flags
  @Prop({ default: false })
  canLogin: boolean; // Set to true after first password change

  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop({ type: String, default: null })
  activationToken: string;

  @Prop({ type: Date, default: null })
  activationTokenExpiry: Date;

  @Prop({ type: String, default: null })
  passwordResetToken: string;

  @Prop({ type: Date, default: null })
  passwordResetExpiry: Date;

  @Prop({ type: String, default: null })
  refreshToken: string;

  @Prop({ type: Date, default: null })
  lastLogin: Date;

  @Prop({ type: String, default: null })
  lastLoginIp: string;

  // Notification preferences
  @Prop({ type: Object, default: {} })
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    disbursementCreated: boolean;
    disbursementValidated: boolean;
    disbursementRejected: boolean;
    disbursementCompleted: boolean;
    chatMessages: boolean;
    systemAlerts: boolean;
  };

  // Profile
  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String, default: 'fr' })
  preferredLanguage: string;

  // Approval limits (for validators)
  @Prop({ type: Number, default: null })
  maxApprovalAmount: number; // Can approve disbursements up to this amount
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ company: 1, isDeleted: 1 });
UserSchema.index({ isKaeyrosUser: 1 });
CompanySchema.index({ slug: 1 });
CompanySchema.index({ status: 1, isDeleted: 1 });













import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './core-entities.schema';

// ==================== PERMISSION SCHEMA ====================

export enum PermissionResource {
  // Disbursements
  DISBURSEMENT = 'disbursement',
  COLLECTION = 'collection',
  
  // Settings
  DEPARTMENT = 'department',
  OFFICE = 'office',
  DISBURSEMENT_TYPE = 'disbursement_type',
  BENEFICIARY = 'beneficiary',
  
  // User Management
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  
  // Reports & Data
  REPORT = 'report',
  EXPORT = 'export',
  AUDIT_LOG = 'audit_log',
  
  // Communication
  CHAT = 'chat',
  NOTIFICATION = 'notification',
  
  // Company Settings
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
  FORCE_COMPLETE = 'force_complete', // Super admin bypass
  RESTORE = 'restore',
}

@Schema({ timestamps: true })
export class Permission extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Create Disbursement", "Validate as Dept Head"

  @Prop({ required: true, trim: true })
  code: string; // e.g., "disbursement.create", "disbursement.validate"

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: PermissionResource, required: true })
  resource: PermissionResource;

  @Prop({ type: String, enum: PermissionAction, required: true })
  action: PermissionAction;

  @Prop({ type: Boolean, default: false })
  isSystemPermission: boolean; // Created by system, cannot be deleted

  // Conditions for this permission (optional)
  @Prop({ type: Object, default: null })
  conditions: {
    maxAmount?: number; // For disbursement approvals
    departmentRestricted?: boolean; // Only their department
    officeRestricted?: boolean; // Only their office
  };
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// ==================== ROLE SCHEMA ====================

@Schema({ timestamps: true })
export class Role extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Senior Validator", "Regional Manager"

  @Prop({ type: String })
  description: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isSystemRole: boolean; // Predefined roles (Validator, Dept Head, etc.)

  @Prop({ type: String, default: null })
  systemRoleType: string; // Links to UserRole enum if system role

  // Role hierarchy level (for approval chains)
  @Prop({ type: Number, default: 0 })
  hierarchyLevel: number; // 0 = Agent, 1 = Dept Head, 2 = Validator, 3 = Super Admin
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// ==================== DEPARTMENT SCHEMA ====================

@Schema({ timestamps: true })
export class Department extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "IT", "Finance", "Operations"

  @Prop({ type: String })
  code: string; // e.g., "IT-001", "FIN-001"

  @Prop({ type: String })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  head: MongooseSchema.Types.ObjectId; // Department Head

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', default: null })
  parentDepartment: MongooseSchema.Types.ObjectId; // For sub-departments

  @Prop({ type: Number, default: 0 })
  userCount: number;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// ==================== OFFICE SCHEMA ====================

@Schema({ timestamps: true })
export class Office extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Douala", "Yaoundé", "Kribi"

  @Prop({ type: String })
  code: string; // e.g., "DLA", "YDE", "KBI"

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  manager: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  userCount: number;
}

export const OfficeSchema = SchemaFactory.createForClass(Office);

// ==================== DISBURSEMENT TYPE SCHEMA ====================

@Schema({ timestamps: true })
export class DisbursementType extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Monthly Bills", "Office Supplies", "Salaries"

  @Prop({ type: String })
  code: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  category: string; // e.g., "Operational", "Administrative", "Payroll"

  // Validation workflow for this type
  @Prop({ type: Boolean, default: true })
  requiresDeptHeadValidation: boolean;

  @Prop({ type: Boolean, default: true })
  requiresValidatorApproval: boolean;

  @Prop({ type: Boolean, default: true })
  requiresCashierExecution: boolean;

  // Auto-approval rules
  @Prop({ type: Number, default: null })
  autoApproveUnder: number; // Auto-approve if amount is below this

  @Prop({ type: String })
  icon: string; // For UI
  
  @Prop({ type: String })
  color: string; // For UI
}

export const DisbursementTypeSchema = SchemaFactory.createForClass(DisbursementType);

// ==================== BENEFICIARY SCHEMA ====================

@Schema({ timestamps: true })
export class Beneficiary extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ['individual', 'company', 'supplier', 'employee', 'other'], default: 'individual' })
  type: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DisbursementType', default: null })
  disbursementType: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  bankName: string;

  @Prop({ type: String })
  accountNumber: string;

  @Prop({ type: String })
  taxId: string;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: Number, default: 0 })
  totalDisbursed: number; // Lifetime total disbursed to this beneficiary
}

export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);

// ==================== EMAIL SETTINGS SCHEMA ====================

@Schema({ timestamps: true })
export class EmailSettings extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // Global email toggle
  @Prop({ type: Boolean, default: true })
  emailNotificationsEnabled: boolean;

  // Per-action email settings
  @Prop({ type: Object, default: {} })
  notifications: {
    disbursementCreated: {
      enabled: boolean;
      recipients: string[]; // Role codes or user IDs
      cc: string[];
    };
    disbursementDeptHeadPending: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementValidatorPending: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementCashierPending: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementCompleted: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementRejected: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    userCreated: {
      enabled: boolean;
      recipients: string[];
    };
    passwordReset: {
      enabled: boolean;
    };
  };

  // Email templates customization
  @Prop({ type: String })
  emailFooter: string;

  @Prop({ type: String })
  emailHeaderLogoUrl: string;

  @Prop({ type: String })
  fromEmail: string;

  @Prop({ type: String })
  fromName: string;
}

export const EmailSettingsSchema = SchemaFactory.createForClass(EmailSettings);

// ==================== REMINDER SETTINGS SCHEMA ====================

@Schema({ timestamps: true })
export class ReminderSettings extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  remindersEnabled: boolean;

  // Reminder intervals (in minutes before deadline)
  @Prop({ type: [Number], default: [2880, 1440, 180, 45, 15] }) // 2 days, 1 day, 3 hours, 45min, 15min
  reminderIntervals: number[];

  // Who should receive reminders
  @Prop({ type: Object, default: {} })
  recipientRoles: {
    pendingDeptHead: string[]; // Role codes
    pendingValidator: string[];
    pendingCashier: string[];
  };

  // Reminder channels
  @Prop({ type: Boolean, default: true })
  emailReminders: boolean;

  @Prop({ type: Boolean, default: true })
  inAppReminders: boolean;

  @Prop({ type: Boolean, default: false })
  smsReminders: boolean;
}

export const ReminderSettingsSchema = SchemaFactory.createForClass(ReminderSettings);

// Create indexes
PermissionSchema.index({ company: 1, code: 1 }, { unique: true });
RoleSchema.index({ company: 1, name: 1 });
DepartmentSchema.index({ company: 1, isDeleted: 1 });
OfficeSchema.index({ company: 1, isDeleted: 1 });
DisbursementTypeSchema.index({ company: 1, isDeleted: 1 });
BeneficiarySchema.index({ company: 1, isDeleted: 1 });
EmailSettingsSchema.index({ company: 1 }, { unique: true });
ReminderSettingsSchema.index({ company: 1 }, { unique: true });













import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity, DisbursementStatus, PaymentType } from './core-entities.schema';

// ==================== DISBURSEMENT SCHEMA ====================

@Schema({ timestamps: true })
export class Disbursement extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // Reference number (auto-generated)
  @Prop({ required: true, unique: true })
  referenceNumber: string; // e.g., "DISB-2024-001234"

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  @Prop({ type: String, enum: DisbursementStatus, default: DisbursementStatus.DRAFT })
  status: DisbursementStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DisbursementType', required: true })
  disbursementType: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Beneficiary', required: true })
  beneficiary: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  purpose: string; // Detailed purpose/justification

  // Organization context
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  // Payment details
  @Prop({ type: String, enum: PaymentType, default: PaymentType.CASH })
  paymentMethod: PaymentType;

  @Prop({ type: Date, default: null })
  expectedPaymentDate: Date;

  @Prop({ type: Date, default: null })
  actualPaymentDate: Date;

  // Documents
  @Prop({ type: [String], default: [] })
  invoices: string[]; // URLs to uploaded invoices

  @Prop({ type: [String], default: [] })
  attachments: string[]; // URLs to other documents

  // Validation workflow
  @Prop({ type: Object, default: null })
  agentSubmission: {
    submittedBy: MongooseSchema.Types.ObjectId; // User who created
    submittedAt: Date;
    notes: string;
  };

  @Prop({ type: Object, default: null })
  deptHeadValidation: {
    validatedBy: MongooseSchema.Types.ObjectId;
    validatedAt: Date;
    status: 'approved' | 'rejected';
    notes: string;
    skipped: boolean; // If super admin forced completion
    skippedBy: MongooseSchema.Types.ObjectId;
    skippedAt: Date;
  };

  @Prop({ type: Object, default: null })
  validatorApproval: {
    approvedBy: MongooseSchema.Types.ObjectId;
    approvedAt: Date;
    status: 'approved' | 'rejected';
    notes: string;
    skipped: boolean;
    skippedBy: MongooseSchema.Types.ObjectId;
    skippedAt: Date;
  };

  @Prop({ type: Object, default: null })
  cashierExecution: {
    executedBy: MongooseSchema.Types.ObjectId;
    executedAt: Date;
    receiptNumber: string;
    notes: string;
    skipped: boolean;
    skippedBy: MongooseSchema.Types.ObjectId;
    skippedAt: Date;
  };

  // Force completion (super admin bypass)
  @Prop({ type: Boolean, default: false })
  forceCompleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  forceCompletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  forceCompletedAt: Date;

  @Prop({ type: String, default: null })
  forceCompletionReason: string;

  // Retroactive marking (for disbursements done outside system)
  @Prop({ type: Boolean, default: false })
  isRetroactive: boolean;

  @Prop({ type: String, default: null })
  retroactiveReason: string;

  // Rejection tracking
  @Prop({ type: Object, default: null })
  rejection: {
    rejectedBy: MongooseSchema.Types.ObjectId;
    rejectedAt: Date;
    stage: string; // 'dept_head', 'validator'
    reason: string;
  };

  // Completion
  @Prop({ type: Date, default: null })
  completedAt: Date;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  // Priority
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Prop({ type: Date, default: null })
  deadline: Date;

  // Flags
  @Prop({ type: Boolean, default: false })
  isUrgent: boolean;

  @Prop({ type: Boolean, default: false })
  requiresFollowUp: boolean;

  // Tags for categorization
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Internal notes (visible only to certain roles)
  @Prop({ type: String })
  internalNotes: string;
}

export const DisbursementSchema = SchemaFactory.createForClass(Disbursement);

// ==================== COLLECTION (CASH INFLOW) SCHEMA ====================

@Schema({ timestamps: true })
export class Collection extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // Reference number
  @Prop({ required: true, unique: true })
  referenceNumber: string; // e.g., "COLL-2024-001234"

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  // Buyer/Client information
  @Prop({ type: String, required: true })
  buyerName: string;

  @Prop({ type: String })
  buyerCompanyName: string;

  @Prop({ type: String })
  buyerEmail: string;

  @Prop({ type: String })
  buyerPhone: string;

  // Seller information (your company's representative)
  @Prop({ type: String })
  sellerName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  handledBy: MongooseSchema.Types.ObjectId; // User who processed this

  // Payment details
  @Prop({ type: String, enum: PaymentType, required: true })
  paymentType: PaymentType;

  @Prop({ type: String })
  productType: string; // Type of product/service sold

  @Prop({ type: String })
  serviceCategory: string; // Category of service

  @Prop({ type: Number })
  totalAmount: number; // Full amount of transaction

  @Prop({ type: Number })
  advancePayment: number; // Amount paid upfront

  @Prop({ type: Number })
  remainingBalance: number; // Amount still owed

  @Prop({ type: Boolean, default: false })
  isFullyPaid: boolean;

  // Dates
  @Prop({ type: Date, required: true })
  collectionDate: Date; // When payment was received

  @Prop({ type: Date, default: null })
  expectedFullPaymentDate: Date; // When balance is expected

  // Organization context
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', default: null })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  // Documents
  @Prop({ type: [String], default: [] })
  invoices: string[]; // URLs to invoices

  @Prop({ type: [String], default: [] })
  receipts: string[]; // URLs to payment receipts

  @Prop({ type: [String], default: [] })
  contracts: string[]; // URLs to contracts

  @Prop({ type: [String], default: [] })
  attachments: string[]; // Other documents

  // Notes and comments
  @Prop({ type: String })
  comment: string;

  @Prop({ type: String })
  internalNotes: string;

  // Revenue categorization
  @Prop({ type: String })
  revenueCategory: string; // e.g., "Sales", "Services", "Consulting"

  @Prop({ type: String })
  activityType: string; // Specific activity that generated this income

  // Tags
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Linked to any project or contract
  @Prop({ type: String })
  projectReference: string;

  @Prop({ type: String })
  contractReference: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// ==================== CHAT MESSAGE SCHEMA ====================

@Schema({ timestamps: true })
export class ChatMessage extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // Chat can be linked to a disbursement or be general
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Disbursement', default: null })
  disbursement: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: ['disbursement', 'general', 'department', 'office'], default: 'general' })
  chatType: string;

  // Sender and recipient
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  recipient: MongooseSchema.Types.ObjectId; // For direct messages

  // For group chats
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  participants: MongooseSchema.Types.ObjectId[];

  // Message content
  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[]; // URLs to files

  // Threading
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMessage', default: null })
  replyTo: MongooseSchema.Types.ObjectId; // Message this is replying to

  // Read status
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  readBy: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  readAt: { [userId: string]: Date }; // Timestamp when each user read it

  // Metadata
  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Date, default: null })
  editedAt: Date;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Create indexes
DisbursementSchema.index({ company: 1, referenceNumber: 1 }, { unique: true });
DisbursementSchema.index({ company: 1, status: 1, isDeleted: 1 });
DisbursementSchema.index({ company: 1, department: 1, isDeleted: 1 });
DisbursementSchema.index({ company: 1, createdAt: -1 });
DisbursementSchema.index({ beneficiary: 1, isDeleted: 1 });

CollectionSchema.index({ company: 1, referenceNumber: 1 }, { unique: true });
CollectionSchema.index({ company: 1, collectionDate: -1, isDeleted: 1 });
CollectionSchema.index({ company: 1, isFullyPaid: 1, isDeleted: 1 });

ChatMessageSchema.index({ company: 1, disbursement: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
ChatMessageSchema.index({ participants: 1, createdAt: -1 });















import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ActionType } from './core-entities.schema';

// ==================== AUDIT LOG SCHEMA ====================
// THIS IS THE MOST CRITICAL SCHEMA - LOGS EVERYTHING

@Schema({ timestamps: true })
export class AuditLog extends Document {
  // Multi-tenancy
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId; // null for Kaeyros actions

  @Prop({ type: Boolean, default: false })
  isKaeyrosAction: boolean; // true if action performed by Kaeyros user

  // Actor information
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId; // Who performed the action

  @Prop({ type: String })
  userEmail: string; // Denormalized for fast queries

  @Prop({ type: String })
  userName: string; // Denormalized

  @Prop({ type: String })
  userRole: string; // Role at time of action

  // Action details
  @Prop({ type: String, enum: ActionType, required: true })
  action: ActionType;

  @Prop({ type: String, required: true })
  actionDescription: string; // Human-readable description

  // Resource affected
  @Prop({ type: String, required: true })
  resourceType: string; // 'disbursement', 'user', 'company', 'collection', etc.

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  resourceId: MongooseSchema.Types.ObjectId; // ID of affected resource

  @Prop({ type: String, default: null })
  resourceName: string; // Denormalized name for quick display

  // Change tracking (for updates)
  @Prop({ type: Object, default: null })
  previousValues: Record<string, any>; // Before change

  @Prop({ type: Object, default: null })
  newValues: Record<string, any>; // After change

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional context

  // Request information
  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  userAgent: string;

  @Prop({ type: String })
  endpoint: string; // API endpoint called

  @Prop({ type: String })
  method: string; // HTTP method (GET, POST, PUT, DELETE)

  // Timestamp
  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  // Severity for filtering critical actions
  @Prop({ type: String, enum: ['info', 'warning', 'critical'], default: 'info' })
  severity: string;

  // Status
  @Prop({ type: String, enum: ['success', 'failure'], default: 'success' })
  status: string;

  @Prop({ type: String, default: null })
  errorMessage: string; // If action failed

  // For Kaeyros visibility
  @Prop({ type: Boolean, default: false })
  flaggedForReview: boolean; // Kaeyros can flag suspicious actions

  @Prop({ type: String, default: null })
  reviewNotes: string;

  // Chat-specific audit (without message content)
  @Prop({ type: Boolean, default: false })
  isChatAction: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMessage', default: null })
  chatMessageId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  chatRecipient: MongooseSchema.Types.ObjectId; // For chat logs

  // Never delete audit logs (no soft delete)
  @Prop({ type: Boolean, default: false })
  isArchived: boolean; // Instead of delete, we archive old logs
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// ==================== NOTIFICATION SCHEMA ====================

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // Recipient
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  // Notification type
  @Prop({ type: String, required: true })
  type: string; // 'disbursement_pending', 'chat_message', 'reminder', 'system_alert'

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  // Link to related resource
  @Prop({ type: String, default: null })
  resourceType: string; // 'disbursement', 'collection', 'chat', etc.

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, default: null })
  actionUrl: string; // Frontend URL to navigate to

  // Status
  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;

  // Priority
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  // Metadata
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  // Expiry (for temporary notifications)
  @Prop({ type: Date, default: null })
  expiresAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// ==================== DELETED DATA REGISTRY (FOR 30-DAY GRACE PERIOD) ====================

@Schema({ timestamps: true })
export class DeletedDataRegistry extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // What was deleted
  @Prop({ type: String, required: true })
  resourceType: string; // 'disbursement', 'user', 'department', etc.

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  resourceName: string; // For display

  @Prop({ type: Object, default: {} })
  resourceSnapshot: Record<string, any>; // Full data backup (optional)

  // Deletion details
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  deletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  deletedAt: Date;

  @Prop({ type: String })
  deletionReason: string;

  // 30-day grace period
  @Prop({ type: Date, required: true })
  permanentDeleteScheduledFor: Date; // deletedAt + 30 days

  @Prop({ type: Boolean, default: false })
  isRestored: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  restoredBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  restoredAt: Date;

  @Prop({ type: Boolean, default: false })
  isPermanentlyDeleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  permanentlyDeletedBy: MongooseSchema.Types.ObjectId; // Kaeyros user who confirmed deletion

  @Prop({ type: Date, default: null })
  permanentlyDeletedAt: Date;

  // Kaeyros review
  @Prop({ type: Boolean, default: false })
  requiresKaeyrosApproval: boolean; // For critical deletions

  @Prop({ type: Boolean, default: false })
  approvedByKaeyros: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId;
}

export const DeletedDataRegistrySchema = SchemaFactory.createForClass(DeletedDataRegistry);

// ==================== ERROR LOG SCHEMA ====================
// For application errors and bugs - sent to Kaeyros

@Schema({ timestamps: true })
export class ErrorLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  user: MongooseSchema.Types.ObjectId;

  // Error details
  @Prop({ type: String, required: true })
  errorType: string; // 'server_error', 'database_error', 'validation_error', etc.

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String })
  stackTrace: string;

  // Request details
  @Prop({ type: String })
  endpoint: string;

  @Prop({ type: String })
  method: string;

  @Prop({ type: Object, default: {} })
  requestBody: Record<string, any>;

  @Prop({ type: Object, default: {} })
  requestParams: Record<string, any>;

  @Prop({ type: Object, default: {} })
  requestHeaders: Record<string, any>;

  // Environment
  @Prop({ type: String })
  environment: string; // 'development', 'staging', 'production'

  @Prop({ type: String })
  serverVersion: string;

  @Prop({ type: String })
  nodeVersion: string;

  // Severity
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'critical'], required: true })
  severity: string;

  // Status
  @Prop({ type: Boolean, default: false })
  isResolved: boolean;

  @Prop({ type: Date, default: null })
  resolvedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  resolvedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  resolutionNotes: string;

  // Notification
  @Prop({ type: Boolean, default: false })
  emailSentToKaeyros: boolean;

  @Prop({ type: Date, default: null })
  emailSentAt: Date;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  // For grouping similar errors
  @Prop({ type: String })
  errorHash: string; // Hash of error message + stack trace

  @Prop({ type: Number, default: 1 })
  occurrenceCount: number; // How many times this error occurred
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);

// ==================== ACTIVITY SUMMARY (FOR DASHBOARD) ====================
// Pre-computed daily/weekly/monthly stats

@Schema({ timestamps: true })
export class ActivitySummary extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly'], required: true })
  period: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  // Disbursement stats
  @Prop({ type: Object, default: {} })
  disbursements: {
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    totalAmount: number;
    averageAmount: number;
    byDepartment: { [key: string]: number };
    byType: { [key: string]: number };
  };

  // Collection stats
  @Prop({ type: Object, default: {} })
  collections: {
    total: number;
    totalAmount: number;
    fullyPaid: number;
    partiallyPaid: number;
    byPaymentType: { [key: string]: number };
  };

  // User activity
  @Prop({ type: Object, default: {} })
  userActivity: {
    activeUsers: number;
    newUsers: number;
    loginCount: number;
    mostActiveUser: string;
  };

  // System health
  @Prop({ type: Object, default: {} })
  systemHealth: {
    errorCount: number;
    criticalErrors: number;
    averageResponseTime: number;
  };

  @Prop({ type: Date, default: Date.now })
  computedAt: Date;
}

export const ActivitySummarySchema = SchemaFactory.createForClass(ActivitySummary);

// Create indexes for performance
AuditLogSchema.index({ company: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, user: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ isKaeyrosAction: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });

NotificationSchema.index({ company: 1, user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ company: 1, user: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

DeletedDataRegistrySchema.index({ company: 1, permanentDeleteScheduledFor: 1 });
DeletedDataRegistrySchema.index({ company: 1, isRestored: 1, isPermanentlyDeleted: 1 });

ErrorLogSchema.index({ company: 1, timestamp: -1 });
ErrorLogSchema.index({ severity: 1, isResolved: 1 });
ErrorLogSchema.index({ errorHash: 1 });
ErrorLogSchema.index({ emailSentToKaeyros: 1, timestamp: -1 });

ActivitySummarySchema.index({ company: 1, period: 1, startDate: -1 });


















import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity, DisbursementStatus, PaymentType } from './core-entities.schema';

// ==================== DISBURSEMENT ACTION HISTORY SCHEMA ====================
// This tracks EVERY action taken on a disbursement with timestamp

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

@Schema({ _id: false, timestamps: false })
export class DisbursementAction {
  @Prop({ type: String, enum: DisbursementActionType, required: true })
  action: DisbursementActionType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  performedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  performedByName: string; // Denormalized for quick display

  @Prop({ type: String })
  performedByRole: string; // Role at time of action

  @Prop({ type: Date, required: true, default: Date.now })
  performedAt: Date;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: String })
  reason: string; // For rejections, undos

  @Prop({ type: Object, default: {} })
  metadata: {
    previousStatus?: string;
    newStatus?: string;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    // For undos - what action was undone
    undoneAction?: {
      actionId: string; // Reference to the action being undone
      originalAction: string;
      originalPerformedBy: string;
      originalPerformedAt: Date;
    };
  };
}

export const DisbursementActionSchema = SchemaFactory.createForClass(DisbursementAction);

// ==================== WORKFLOW STEP SCHEMA ====================
// Tracks current state + complete history of each workflow step

@Schema({ _id: false, timestamps: false })
export class WorkflowStep {
  @Prop({ type: String, enum: ['pending', 'approved', 'rejected', 'skipped', 'undone'], default: 'pending' })
  status: string;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Date, default: null })
  completedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  completedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  notes: string;

  // History of ALL actions on this step (validations, undos, etc.)
  @Prop({ type: [DisbursementActionSchema], default: [] })
  history: DisbursementAction[];

  // For rejected steps
  @Prop({ type: String })
  rejectionReason: string;

  // For skipped steps (force complete)
  @Prop({ type: Boolean, default: false })
  wasSkipped: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  skippedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  skippedAt: Date;

  // Undo tracking
  @Prop({ type: Boolean, default: false })
  wasUndone: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  undoneBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  undoneAt: Date;

  @Prop({ type: String })
  undoReason: string;
}

export const WorkflowStepSchema = SchemaFactory.createForClass(WorkflowStep);

// ==================== DISBURSEMENT SCHEMA (REDESIGNED) ====================

@Schema({ timestamps: true })
export class Disbursement extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  // Reference number (auto-generated)
  @Prop({ required: true, unique: true })
  referenceNumber: string; // e.g., "DISB-2024-001234"

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  @Prop({ type: String, enum: DisbursementStatus, default: DisbursementStatus.DRAFT })
  status: DisbursementStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DisbursementType', required: true })
  disbursementType: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Beneficiary', required: true })
  beneficiary: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  purpose: string;

  // Organization context
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  // Payment details
  @Prop({ type: String, enum: PaymentType, default: PaymentType.CASH })
  paymentMethod: PaymentType;

  @Prop({ type: Date, default: null })
  expectedPaymentDate: Date;

  @Prop({ type: Date, default: null })
  actualPaymentDate: Date;

  // Documents
  @Prop({ type: [String], default: [] })
  invoices: string[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  // ==================== WORKFLOW STEPS WITH FULL HISTORY ====================
  
  @Prop({ type: WorkflowStepSchema, default: {} })
  agentSubmission: WorkflowStep;

  @Prop({ type: WorkflowStepSchema, default: {} })
  deptHeadValidation: WorkflowStep;

  @Prop({ type: WorkflowStepSchema, default: {} })
  validatorApproval: WorkflowStep;

  @Prop({ type: WorkflowStepSchema, default: {} })
  cashierExecution: WorkflowStep;

  // ==================== COMPLETE ACTION HISTORY ====================
  // Array of ALL actions ever taken on this disbursement (NEVER delete)
  
  @Prop({ type: [DisbursementActionSchema], default: [] })
  actionHistory: DisbursementAction[];

  // ==================== STATUS TRACKING ====================
  
  @Prop({ type: Object, default: {} })
  statusTimeline: {
    draft?: Date;
    pendingDeptHead?: Date;
    pendingValidator?: Date;
    pendingCashier?: Date;
    completed?: Date;
    rejected?: Date;
    cancelled?: Date;
  };

  // ==================== FORCE COMPLETION ====================
  
  @Prop({ type: Boolean, default: false })
  forceCompleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  forceCompletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  forceCompletedAt: Date;

  @Prop({ type: String, default: null })
  forceCompletionReason: string;

  @Prop({ type: Boolean, default: false })
  forceCompletionUndone: boolean; // Track if force completion was undone

  // ==================== RETROACTIVE MARKING ====================
  
  @Prop({ type: Boolean, default: false })
  isRetroactive: boolean;

  @Prop({ type: String, default: null })
  retroactiveReason: string;

  @Prop({ type: Date, default: null })
  retroactiveMarkedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  retroactiveMarkedBy: MongooseSchema.Types.ObjectId;

  // ==================== REJECTION TRACKING ====================
  
  @Prop({ type: Object, default: null })
  currentRejection: {
    rejectedBy: MongooseSchema.Types.ObjectId;
    rejectedAt: Date;
    stage: string; // 'dept_head', 'validator'
    reason: string;
    wasUndone: boolean;
  };

  // History of all rejections (if rejected multiple times)
  @Prop({ type: Array, default: [] })
  rejectionHistory: Array<{
    rejectedBy: MongooseSchema.Types.ObjectId;
    rejectedAt: Date;
    stage: string;
    reason: string;
    undoneBy?: MongooseSchema.Types.ObjectId;
    undoneAt?: Date;
    undoReason?: string;
  }>;

  // ==================== COMPLETION ====================
  
  @Prop({ type: Date, default: null })
  completedAt: Date;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  // ==================== ADDITIONAL FIELDS ====================
  
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Prop({ type: Date, default: null })
  deadline: Date;

  @Prop({ type: Boolean, default: false })
  isUrgent: boolean;

  @Prop({ type: Boolean, default: false })
  requiresFollowUp: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  internalNotes: string;

  // Comments/Discussion
  @Prop({ type: Array, default: [] })
  comments: Array<{
    user: MongooseSchema.Types.ObjectId;
    userName: string;
    comment: string;
    createdAt: Date;
  }>;

  // ==================== UNDO PERMISSIONS ====================
  // Track what can be undone and by whom
  
  @Prop({ type: Object, default: {} })
  undoPermissions: {
    canUndoDeptHeadValidation: boolean;
    canUndoValidatorApproval: boolean;
    canUndoCashierExecution: boolean;
    canUndoRejection: boolean;
    canUndoForceCompletion: boolean;
  };
}

export const DisbursementSchema = SchemaFactory.createForClass(Disbursement);

// ==================== COLLECTION (CASH INFLOW) SCHEMA ====================

@Schema({ timestamps: true })
export class Collection extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  referenceNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  @Prop({ type: String, required: true })
  buyerName: string;

  @Prop({ type: String })
  buyerCompanyName: string;

  @Prop({ type: String })
  buyerEmail: string;

  @Prop({ type: String })
  buyerPhone: string;

  @Prop({ type: String })
  sellerName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  handledBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: PaymentType, required: true })
  paymentType: PaymentType;

  @Prop({ type: String })
  productType: string;

  @Prop({ type: String })
  serviceCategory: string;

  @Prop({ type: Number })
  totalAmount: number;

  @Prop({ type: Number })
  advancePayment: number;

  @Prop({ type: Number })
  remainingBalance: number;

  @Prop({ type: Boolean, default: false })
  isFullyPaid: boolean;

  @Prop({ type: Date, required: true })
  collectionDate: Date;

  @Prop({ type: Date, default: null })
  expectedFullPaymentDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', default: null })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  invoices: string[];

  @Prop({ type: [String], default: [] })
  receipts: string[];

  @Prop({ type: [String], default: [] })
  contracts: string[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: String })
  comment: string;

  @Prop({ type: String })
  internalNotes: string;

  @Prop({ type: String })
  revenueCategory: string;

  @Prop({ type: String })
  activityType: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  projectReference: string;

  @Prop({ type: String })
  contractReference: string;

  // Action history for collections too
  @Prop({ type: [DisbursementActionSchema], default: [] })
  actionHistory: DisbursementAction[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// ==================== CHAT MESSAGE SCHEMA ====================

@Schema({ timestamps: true })
export class ChatMessage extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Disbursement', default: null })
  disbursement: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: ['disbursement', 'general', 'department', 'office'], default: 'general' })
  chatType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  recipient: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  participants: MongooseSchema.Types.ObjectId[];

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMessage', default: null })
  replyTo: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  readBy: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  readAt: { [userId: string]: Date };

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Date, default: null })
  editedAt: Date;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Create indexes
DisbursementSchema.index({ company: 1, referenceNumber: 1 }, { unique: true });
DisbursementSchema.index({ company: 1, status: 1, isDeleted: 1 });
DisbursementSchema.index({ company: 1, department: 1, isDeleted: 1 });
DisbursementSchema.index({ company: 1, createdAt: -1 });
DisbursementSchema.index({ beneficiary: 1, isDeleted: 1 });
DisbursementSchema.index({ 'actionHistory.performedAt': -1 }); // For timeline queries

CollectionSchema.index({ company: 1, referenceNumber: 1 }, { unique: true });
CollectionSchema.index({ company: 1, collectionDate: -1, isDeleted: 1 });
CollectionSchema.index({ company: 1, isFullyPaid: 1, isDeleted: 1 });

ChatMessageSchema.index({ company: 1, disbursement: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
ChatMessageSchema.index({ participants: 1, createdAt: -1 });