import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
  IsNumber,
  IsDate,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../../../database/schemas/enums';

export enum CompanyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export enum PayoutFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export class WorkflowSettingsDto {
  @IsBoolean()
  @IsOptional()
  requireDeptHeadApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  requireValidatorApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  requireCashierExecution?: boolean;

  @IsNumber()
  @IsOptional()
  maxAmountNoApproval?: number;
}

export class EmailNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  onNewDisbursement?: boolean;

  @IsBoolean()
  @IsOptional()
  onDisbursementApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  onDisbursementRejected?: boolean;

  @IsBoolean()
  @IsOptional()
  onCollectionAdded?: boolean;

  @IsBoolean()
  @IsOptional()
  dailySummary?: boolean;
}

export class NotificationChannelsDto {
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @IsBoolean()
  @IsOptional()
  whatsapp?: boolean;

  @IsBoolean()
  @IsOptional()
  inApp?: boolean;
}

export class PayoutScheduleDto {
  @IsEnum(PayoutFrequency)
  @IsOptional()
  frequency?: PayoutFrequency;

  @IsNumber()
  @IsOptional()
  dayOfMonth?: number;

  @IsString()
  @IsOptional()
  dayOfWeek?: string;
}

export class CreateCompanyByKaeyrosDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Company description',
    example: 'A leading technology company',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Company email',
    example: 'contact@acme.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Company phone',
    example: '+237 123 456 789',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Main Street, Douala',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Company city',
    example: 'Douala',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Company country',
    example: 'Cameroon',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Company industry',
    example: 'Technology',
    required: false,
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://www.acme.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Initial company status',
    enum: CompanyStatus,
    example: CompanyStatus.TRIAL,
    required: false,
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'enterprise',
    required: false,
  })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiProperty({
    description: 'Maximum number of users',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  @ApiProperty({
    description: 'Default currency',
    example: 'XAF',
    required: false,
  })
  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @ApiProperty({
    description: 'Payment methods',
    example: ['cash', 'bank_transfer'],
    required: false,
    isArray: true,
    enum: PaymentType,
  })
  @IsArray()
  @IsEnum(PaymentType, { each: true })
  @IsOptional()
  paymentMethods?: PaymentType[];

  @ApiProperty({
    description: 'Timezone',
    example: 'Africa/Douala',
    required: false,
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    description: 'Supported languages',
    example: ['fr', 'en'],
    required: false,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedLanguages?: string[];

  @ApiProperty({
    description: 'Default language',
    example: 'fr',
    required: false,
  })
  @IsString()
  @IsOptional()
  defaultLanguage?: string;

  @ApiProperty({
    description: 'Logo URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: 'Primary color',
    example: '#1d4ed8',
    required: false,
  })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({
    description: 'Notification channels',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationChannelsDto)
  notificationChannels?: NotificationChannelsDto;

  @ApiProperty({
    description: 'Email notification settings',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailNotificationSettingsDto)
  emailNotificationSettings?: EmailNotificationSettingsDto;

  @ApiProperty({
    description: 'Workflow settings',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowSettingsDto)
  workflowSettings?: WorkflowSettingsDto;

  @ApiProperty({
    description: 'Payout schedule',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PayoutScheduleDto)
  payoutSchedule?: PayoutScheduleDto;

  @ApiProperty({
    description: 'Trial end date',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialEndsAt?: Date;

  @ApiProperty({
    description: 'Feature flags',
    example: { disbursements: true, collections: true, reports: true },
    required: false,
  })
  @IsObject()
  @IsOptional()
  features?: Record<string, boolean>;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Admin user first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @ApiProperty({
    description: 'Admin user last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @ApiProperty({
    description: 'Admin user email',
    example: 'john.doe@acme.com',
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;
}

export class UpdateCompanyStatusDto {
  @ApiProperty({
    description: 'New company status',
    enum: CompanyStatus,
    example: CompanyStatus.ACTIVE,
  })
  @IsEnum(CompanyStatus)
  @IsNotEmpty()
  status: CompanyStatus;

  @ApiProperty({
    description: 'Reason for status change',
    example: 'Payment received, activating subscription',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ToggleCompanyFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'disbursements',
  })
  @IsString()
  @IsNotEmpty()
  feature: string;

  @ApiProperty({
    description: 'Whether to enable or disable the feature',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;
}

export class UpdateCompanyByKaeyrosDto {
  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Company description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Company email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Company phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Company address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Company city', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Company country', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Company industry', required: false })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({ description: 'Company status', required: false, enum: CompanyStatus })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiProperty({ description: 'Subscription plan', required: false })
  @IsString()
  @IsOptional()
  planType?: string;

  @ApiProperty({ description: 'Maximum number of users', required: false })
  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  @ApiProperty({
    description: 'Trial end date',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialEndsAt?: Date;

  @ApiProperty({ description: 'Default currency', required: false, example: 'XAF' })
  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @ApiProperty({ description: 'Payment methods', required: false, isArray: true, enum: PaymentType })
  @IsArray()
  @IsEnum(PaymentType, { each: true })
  @IsOptional()
  paymentMethods?: PaymentType[];

  @ApiProperty({ description: 'Timezone', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ description: 'Supported languages', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedLanguages?: string[];

  @ApiProperty({ description: 'Default language', required: false })
  @IsString()
  @IsOptional()
  defaultLanguage?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: 'Primary color', required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ description: 'Notification channels', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationChannelsDto)
  notificationChannels?: NotificationChannelsDto;

  @ApiProperty({ description: 'Email notification settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailNotificationSettingsDto)
  emailNotificationSettings?: EmailNotificationSettingsDto;

  @ApiProperty({ description: 'Workflow settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowSettingsDto)
  workflowSettings?: WorkflowSettingsDto;

  @ApiProperty({ description: 'Payout schedule', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PayoutScheduleDto)
  payoutSchedule?: PayoutScheduleDto;

  @ApiProperty({ description: 'Feature flags', required: false })
  @IsObject()
  @IsOptional()
  features?: Record<string, boolean>;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
