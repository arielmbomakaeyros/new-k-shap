import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsNumber, IsArray, IsObject } from 'class-validator';

class WorkflowStepDto {
  @ApiProperty({ description: 'Step status', example: 'approved' })
  status: string;

  @ApiProperty({ description: 'Whether step is completed', example: true })
  isCompleted: boolean;

  @ApiProperty({ description: 'When step was completed', example: '2024-01-15T10:30:00.000Z', required: false })
  completedAt?: Date;

  @ApiProperty({ description: 'Who completed the step', required: false })
  completedBy?: any;

  @ApiProperty({ description: 'Notes for this step', required: false })
  notes?: string;

  @ApiProperty({ description: 'Rejection reason if rejected', required: false })
  rejectionReason?: string;
}

class DisbursementActionDto {
  @ApiProperty({ description: 'Action type', example: 'dept_head_validated' })
  action: string;

  @ApiProperty({ description: 'Who performed the action' })
  performedBy: any;

  @ApiProperty({ description: 'Name of performer', example: 'John Doe' })
  performedByName: string;

  @ApiProperty({ description: 'Role of performer', example: 'Department Head' })
  performedByRole: string;

  @ApiProperty({ description: 'When action was performed', example: '2024-01-15T10:30:00.000Z' })
  performedAt: Date;

  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;

  @ApiProperty({ description: 'Reason', required: false })
  reason?: string;
}

class BeneficiaryPopulatedDto {
  @ApiProperty({ description: 'Beneficiary ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'First name', example: 'Jane' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  lastName: string;

  @ApiProperty({ description: 'Email', example: 'jane@example.com' })
  email: string;

  @ApiProperty({ description: 'Phone', example: '+237123456789', required: false })
  phone?: string;

  @ApiProperty({ description: 'Bank name', example: 'Afriland Bank', required: false })
  bankName?: string;

  @ApiProperty({ description: 'Account number', example: '1234567890', required: false })
  accountNumber?: string;
}

class DepartmentPopulatedDto {
  @ApiProperty({ description: 'Department ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Department name', example: 'Finance' })
  name: string;

  @ApiProperty({ description: 'Department description', required: false })
  description?: string;
}

class DisbursementTypePopulatedDto {
  @ApiProperty({ description: 'Disbursement type ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Type name', example: 'Salary Payment' })
  name: string;

  @ApiProperty({ description: 'Type description', required: false })
  description?: string;
}

class OfficePopulatedDto {
  @ApiProperty({ description: 'Office ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Office name', example: 'Headquarters' })
  name: string;

  @ApiProperty({ description: 'Office code', example: 'HQ-001', required: false })
  code?: string;
}

export class DisbursementResponseDto {
  @ApiProperty({
    description: 'Disbursement ID',
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
    example: 'DIS-2024-00001',
  })
  @IsString()
  referenceNumber: string;

  @ApiProperty({
    description: 'Amount of the disbursement',
    example: 150000,
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
    description: 'Current status',
    example: 'pending_validator',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Disbursement type (populated)',
    type: DisbursementTypePopulatedDto,
  })
  disbursementType: DisbursementTypePopulatedDto;

  @ApiProperty({
    description: 'Beneficiary (populated)',
    type: BeneficiaryPopulatedDto,
  })
  beneficiary: BeneficiaryPopulatedDto;

  @ApiProperty({
    description: 'Description of the disbursement',
    example: 'Payment for office supplies procurement',
  })
  @IsString()
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
    description: 'Department (populated)',
    type: DepartmentPopulatedDto,
  })
  department: DepartmentPopulatedDto;

  @ApiProperty({
    description: 'Office (populated)',
    type: OfficePopulatedDto,
    required: false,
  })
  @IsOptional()
  office?: OfficePopulatedDto;

  @ApiProperty({
    description: 'Payment method',
    example: 'bank_transfer',
  })
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    description: 'Expected payment date',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  expectedPaymentDate?: Date;

  @ApiProperty({
    description: 'Actual payment date',
    example: '2024-02-14T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  actualPaymentDate?: Date;

  @ApiProperty({
    description: 'List of invoice file URLs',
    type: [String],
    example: ['https://storage.example.com/invoices/inv-001.pdf'],
  })
  @IsArray()
  invoices: string[];

  @ApiProperty({
    description: 'List of attachment file URLs',
    type: [String],
    example: ['https://storage.example.com/attachments/doc-001.pdf'],
  })
  @IsArray()
  attachments: string[];

  @ApiProperty({
    description: 'Agent submission workflow step',
    type: WorkflowStepDto,
  })
  agentSubmission: WorkflowStepDto;

  @ApiProperty({
    description: 'Department head validation workflow step',
    type: WorkflowStepDto,
  })
  deptHeadValidation: WorkflowStepDto;

  @ApiProperty({
    description: 'Validator approval workflow step',
    type: WorkflowStepDto,
  })
  validatorApproval: WorkflowStepDto;

  @ApiProperty({
    description: 'Cashier execution workflow step',
    type: WorkflowStepDto,
  })
  cashierExecution: WorkflowStepDto;

  @ApiProperty({
    description: 'Complete action history',
    type: [DisbursementActionDto],
  })
  @IsArray()
  actionHistory: DisbursementActionDto[];

  @ApiProperty({
    description: 'Status timeline',
    example: {
      draft: '2024-01-10T09:00:00.000Z',
      pendingDeptHead: '2024-01-10T10:00:00.000Z',
      pendingValidator: '2024-01-11T14:00:00.000Z',
    },
  })
  @IsObject()
  statusTimeline: Record<string, Date>;

  @ApiProperty({
    description: 'Whether disbursement was force completed',
    example: false,
  })
  @IsBoolean()
  forceCompleted: boolean;

  @ApiProperty({
    description: 'Whether this is a retroactive disbursement',
    example: false,
  })
  @IsBoolean()
  isRetroactive: boolean;

  @ApiProperty({
    description: 'Priority level',
    example: 'medium',
  })
  @IsString()
  priority: string;

  @ApiProperty({
    description: 'Deadline',
    example: '2024-02-20T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  deadline?: Date;

  @ApiProperty({
    description: 'Whether this is urgent',
    example: false,
  })
  @IsBoolean()
  isUrgent: boolean;

  @ApiProperty({
    description: 'Whether this requires follow-up',
    example: false,
  })
  @IsBoolean()
  requiresFollowUp: boolean;

  @ApiProperty({
    description: 'Tags for categorization',
    type: [String],
    example: ['supplies', 'procurement'],
  })
  @IsArray()
  tags: string[];

  @ApiProperty({
    description: 'Internal notes',
    example: 'Priority vendor payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({
    description: 'Whether disbursement is completed',
    example: false,
  })
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty({
    description: 'Completion date',
    example: '2024-02-14T15:30:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  completedAt?: Date;

  @ApiProperty({
    description: 'Whether disbursement is soft deleted',
    example: false,
  })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({
    description: 'Whether disbursement is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-10T09:00:00.000Z',
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
