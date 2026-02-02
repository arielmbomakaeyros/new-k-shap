import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsNumber, IsArray, IsEmail } from 'class-validator';

class DepartmentPopulatedDto {
  @ApiProperty({ description: 'Department ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Department name', example: 'Sales' })
  name: string;
}

class OfficePopulatedDto {
  @ApiProperty({ description: 'Office ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Office name', example: 'Headquarters' })
  name: string;

  @ApiProperty({ description: 'Office code', example: 'HQ-001', required: false })
  code?: string;
}

class HandledByPopulatedDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'First name', example: 'Marie' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Ngono' })
  lastName: string;

  @ApiProperty({ description: 'Email', example: 'marie@example.com' })
  email: string;
}

export class CollectionResponseDto {
  @ApiProperty({
    description: 'Collection ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Unique reference number',
    example: 'COL-2024-00001',
  })
  @IsString()
  referenceNumber: string;

  @ApiProperty({
    description: 'Amount collected',
    example: 250000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'XAF',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Name of the buyer/payer',
    example: 'Jean Pierre Kamga',
  })
  @IsString()
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
    description: 'Name of the seller',
    example: 'Marie Ngono',
    required: false,
  })
  @IsString()
  @IsOptional()
  sellerName?: string;

  @ApiProperty({
    description: 'User who handled the collection (populated)',
    type: HandledByPopulatedDto,
    required: false,
  })
  @IsOptional()
  handledBy?: HandledByPopulatedDto;

  @ApiProperty({
    description: 'Payment method used',
    example: 'cash',
  })
  @IsString()
  paymentType: string;

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
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    description: 'Advance payment received',
    example: 250000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  advancePayment?: number;

  @ApiProperty({
    description: 'Remaining balance',
    example: 250000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  remainingBalance?: number;

  @ApiProperty({
    description: 'Whether the payment is fully completed',
    example: false,
  })
  @IsBoolean()
  isFullyPaid: boolean;

  @ApiProperty({
    description: 'Date of collection',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDate()
  collectionDate: Date;

  @ApiProperty({
    description: 'Expected date for full payment',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  expectedFullPaymentDate?: Date;

  @ApiProperty({
    description: 'Department (populated)',
    type: DepartmentPopulatedDto,
    required: false,
  })
  @IsOptional()
  department?: DepartmentPopulatedDto;

  @ApiProperty({
    description: 'Office (populated)',
    type: OfficePopulatedDto,
    required: false,
  })
  @IsOptional()
  office?: OfficePopulatedDto;

  @ApiProperty({
    description: 'List of invoice file URLs',
    type: [String],
    example: ['https://storage.example.com/invoices/inv-001.pdf'],
  })
  @IsArray()
  invoices: string[];

  @ApiProperty({
    description: 'List of receipt file URLs',
    type: [String],
    example: ['https://storage.example.com/receipts/rec-001.pdf'],
  })
  @IsArray()
  receipts: string[];

  @ApiProperty({
    description: 'List of contract file URLs',
    type: [String],
    example: ['https://storage.example.com/contracts/contract-001.pdf'],
  })
  @IsArray()
  contracts: string[];

  @ApiProperty({
    description: 'List of other attachment file URLs',
    type: [String],
    example: ['https://storage.example.com/attachments/doc-001.pdf'],
  })
  @IsArray()
  attachments: string[];

  @ApiProperty({
    description: 'Comment or notes',
    example: 'Partial payment for order #12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    description: 'Internal notes',
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
    type: [String],
    example: ['retail', 'electronics'],
  })
  @IsArray()
  tags: string[];

  @ApiProperty({
    description: 'Project reference',
    example: 'PROJ-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  projectReference?: string;

  @ApiProperty({
    description: 'Contract reference',
    example: 'CONTRACT-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  contractReference?: string;

  @ApiProperty({
    description: 'Whether collection is soft deleted',
    example: false,
  })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({
    description: 'Whether collection is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T14:30:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}
