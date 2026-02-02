import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsNumber, IsObject, IsArray, IsEmail } from 'class-validator';

export class CompanyWithStatsResponseDto {
  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Company email',
    example: 'contact@acme.com',
  })
  @IsEmail()
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
    description: 'Company status',
    example: 'active',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'enterprise',
    required: false,
  })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiProperty({
    description: 'Whether the company is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Number of users',
    example: 25,
  })
  @IsNumber()
  userCount: number;

  @ApiProperty({
    description: 'Maximum number of users allowed',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  @ApiProperty({
    description: 'Total disbursements count',
    example: 500,
  })
  @IsNumber()
  totalDisbursements: number;

  @ApiProperty({
    description: 'Total collections count',
    example: 750,
  })
  @IsNumber()
  totalCollections: number;

  @ApiProperty({
    description: 'Total disbursement amount',
    example: 50000000,
  })
  @IsNumber()
  totalDisbursementAmount: number;

  @ApiProperty({
    description: 'Total collection amount',
    example: 80000000,
  })
  @IsNumber()
  totalCollectionAmount: number;

  @ApiProperty({
    description: 'Feature flags',
    example: { disbursements: true, collections: true, reports: true },
  })
  @IsObject()
  features: Record<string, boolean>;

  @ApiProperty({
    description: 'Trial end date',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  trialEndsAt?: Date;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-01-15T14:30:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  lastActivityAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;
}

export class PlatformStatsResponseDto {
  @ApiProperty({
    description: 'Total number of companies',
    example: 150,
  })
  @IsNumber()
  totalCompanies: number;

  @ApiProperty({
    description: 'Active companies',
    example: 120,
  })
  @IsNumber()
  activeCompanies: number;

  @ApiProperty({
    description: 'Trial companies',
    example: 20,
  })
  @IsNumber()
  trialCompanies: number;

  @ApiProperty({
    description: 'Suspended companies',
    example: 10,
  })
  @IsNumber()
  suspendedCompanies: number;

  @ApiProperty({
    description: 'Total users across all companies',
    example: 2500,
  })
  @IsNumber()
  totalUsers: number;

  @ApiProperty({
    description: 'Total disbursements across all companies',
    example: 75000,
  })
  @IsNumber()
  totalDisbursements: number;

  @ApiProperty({
    description: 'Total collections across all companies',
    example: 100000,
  })
  @IsNumber()
  totalCollections: number;

  @ApiProperty({
    description: 'Monthly revenue',
    example: 25000000,
  })
  @IsNumber()
  monthlyRevenue: number;

  @ApiProperty({
    description: 'New companies this month',
    example: 15,
  })
  @IsNumber()
  newCompaniesThisMonth: number;

  @ApiProperty({
    description: 'Companies by plan breakdown',
    example: { free: 50, starter: 40, professional: 40, enterprise: 20 },
  })
  @IsObject()
  companiesByPlan: Record<string, number>;
}
