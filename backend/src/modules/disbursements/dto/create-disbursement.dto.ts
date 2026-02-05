import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsDate, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum DisbursementStatus {
  DRAFT = 'draft',
  PENDING_DEPT_HEAD = 'pending_dept_head',
  PENDING_VALIDATOR = 'pending_validator',
  PENDING_CASHIER = 'pending_cashier',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum PaymentType {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CHECK = 'check',
  CARD = 'card',
  ORANGE_MONEY = 'orange_money',
  MTN_MONEY = 'mtn_money',
}

export enum DisbursementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateDisbursementDto {
  @ApiProperty({
    description: 'Amount of the disbursement',
    example: 150000,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'XAF',
    default: 'XAF',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Disbursement type ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  disbursementType: string;

  @ApiProperty({
    description: 'Beneficiary ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  beneficiary: string;

  @ApiProperty({
    description: 'Description of the disbursement',
    example: 'Payment for office supplies procurement',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Purpose of the disbursement',
    example: 'Operational expenses',
    required: false,
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({
    description: 'Department ID responsible for this disbursement',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Office ID where the disbursement is processed',
    example: '507f1f77bcf86cd799439014',
    required: false,
  })
  @IsString()
  @IsOptional()
  office?: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentType,
    example: PaymentType.BANK_TRANSFER,
    default: PaymentType.CASH,
    required: false,
  })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentMethod?: PaymentType;

  @ApiProperty({
    description: 'Expected payment date',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expectedPaymentDate?: Date;

  @ApiProperty({
    description: 'List of invoice file URLs',
    example: ['https://storage.example.com/invoices/inv-001.pdf'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  invoices?: string[];

  @ApiProperty({
    description: 'List of attachment file URLs',
    example: ['https://storage.example.com/attachments/doc-001.pdf'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @ApiProperty({
    description: 'Priority level of the disbursement',
    enum: DisbursementPriority,
    example: DisbursementPriority.MEDIUM,
    default: DisbursementPriority.MEDIUM,
    required: false,
  })
  @IsEnum(DisbursementPriority)
  @IsOptional()
  priority?: DisbursementPriority;

  @ApiProperty({
    description: 'Deadline for processing the disbursement',
    example: '2024-02-20T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline?: Date;

  @ApiProperty({
    description: 'Whether this is an urgent disbursement',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @ApiProperty({
    description: 'Tags for categorization',
    example: ['supplies', 'procurement'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Internal notes (only visible to staff)',
    example: 'Priority vendor payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({
    description: 'Whether this is a retroactive disbursement',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRetroactive?: boolean;

  @ApiProperty({
    description: 'Reason for retroactive marking',
    example: 'Emergency payment made before approval',
    required: false,
  })
  @IsString()
  @IsOptional()
  retroactiveReason?: string;
}
