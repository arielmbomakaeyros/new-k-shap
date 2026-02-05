import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsDate, IsBoolean, Min, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentType {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CHECK = 'check',
  CARD = 'card',
  ORANGE_MONEY = 'orange_money',
  MTN_MONEY = 'mtn_money',
}

export class CreateCollectionDto {
  @ApiProperty({
    description: 'Amount collected',
    example: 250000,
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
    description: 'Name of the buyer/payer',
    example: 'Jean Pierre Kamga',
  })
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiProperty({
    description: 'Company name of the buyer',
    example: 'Kamga Enterprises SARL',
    required: false,
  })
  @IsString()
  @IsOptional()
  buyerCompanyName?: string;

  @ApiProperty({
    description: 'Email of the buyer',
    example: 'jp.kamga@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  buyerEmail?: string;

  @ApiProperty({
    description: 'Phone number of the buyer',
    example: '+237 699 123 456',
    required: false,
  })
  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @ApiProperty({
    description: 'Name of the seller/staff who made the sale',
    example: 'Marie Ngono',
    required: false,
  })
  @IsString()
  @IsOptional()
  sellerName?: string;

  @ApiProperty({
    description: 'User ID of the staff who handled this collection',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  handledBy?: string;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentType,
    example: PaymentType.CASH,
  })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: PaymentType;

  @ApiProperty({
    description: 'Type of product sold',
    example: 'Electronics',
    required: false,
  })
  @IsString()
  @IsOptional()
  productType?: string;

  @ApiProperty({
    description: 'Category of service',
    example: 'Consulting',
    required: false,
  })
  @IsString()
  @IsOptional()
  serviceCategory?: string;

  @ApiProperty({
    description: 'Total amount due',
    example: 500000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    description: 'Advance payment received',
    example: 250000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  advancePayment?: number;

  @ApiProperty({
    description: 'Date of collection',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  collectionDate: Date;

  @ApiProperty({
    description: 'Expected date for full payment',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expectedFullPaymentDate?: Date;

  @ApiProperty({
    description: 'Department ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: 'Office ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsString()
  @IsOptional()
  office?: string;

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
    description: 'List of receipt file URLs',
    example: ['https://storage.example.com/receipts/rec-001.pdf'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  receipts?: string[];

  @ApiProperty({
    description: 'List of contract file URLs',
    example: ['https://storage.example.com/contracts/contract-001.pdf'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contracts?: string[];

  @ApiProperty({
    description: 'List of other attachment file URLs',
    example: ['https://storage.example.com/attachments/doc-001.pdf'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @ApiProperty({
    description: 'Comment or notes about the collection',
    example: 'Partial payment for order #12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    description: 'Internal notes (only visible to staff)',
    example: 'Customer requested installment plan',
    required: false,
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({
    description: 'Revenue category',
    example: 'Sales Revenue',
    required: false,
  })
  @IsString()
  @IsOptional()
  revenueCategory?: string;

  @ApiProperty({
    description: 'Type of activity',
    example: 'Product Sale',
    required: false,
  })
  @IsString()
  @IsOptional()
  activityType?: string;

  @ApiProperty({
    description: 'Tags for categorization',
    example: ['retail', 'electronics'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Reference to related project',
    example: 'PROJ-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  projectReference?: string;

  @ApiProperty({
    description: 'Reference to related contract',
    example: 'CONTRACT-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  contractReference?: string;
}
