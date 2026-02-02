import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsDate, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType, DisbursementPriority, DisbursementStatus } from './create-disbursement.dto';

export class UpdateDisbursementDto {
  @ApiProperty({
    description: 'Amount of the disbursement',
    example: 150000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'XAF',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Status of the disbursement',
    enum: DisbursementStatus,
    example: DisbursementStatus.PENDING_DEPT_HEAD,
    required: false,
  })
  @IsEnum(DisbursementStatus)
  @IsOptional()
  status?: DisbursementStatus;

  @ApiProperty({
    description: 'Disbursement type ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  disbursementType?: string;

  @ApiProperty({
    description: 'Beneficiary ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsString()
  @IsOptional()
  beneficiary?: string;

  @ApiProperty({
    description: 'Description of the disbursement',
    example: 'Payment for office supplies procurement',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

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
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

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
    description: 'Actual payment date',
    example: '2024-02-14T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  actualPaymentDate?: Date;

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
    example: DisbursementPriority.HIGH,
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
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @ApiProperty({
    description: 'Whether this requires follow-up',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresFollowUp?: boolean;

  @ApiProperty({
    description: 'Tags for categorization',
    example: ['supplies', 'procurement', 'urgent'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Internal notes (only visible to staff)',
    example: 'Priority vendor payment - expedite',
    required: false,
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;
}
