import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsObject, IsNumber, IsDate, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export enum CompanyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  DELETED = 'deleted',
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
