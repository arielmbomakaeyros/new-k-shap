import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean, IsIn, IsMongoId } from 'class-validator';

export class UpdateBeneficiaryDto {
  @ApiProperty({
    description: 'Beneficiary name',
    example: 'Updated Supermonth',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Beneficiary type',
    example: 'supplier',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['individual', 'company', 'supplier', 'employee', 'other'])
  type?: string;

  @ApiProperty({
    description: 'Disbursement type ID for this beneficiary',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  disbursementType?: string;

  @ApiProperty({
    description: 'Email address of the beneficiary',
    example: 'updated.jane.smith@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number of the beneficiary',
    example: '+1987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Address of the beneficiary',
    example: '456 Main Street',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Bank name of the beneficiary',
    example: 'Updated Bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({
    description: 'Account number of the beneficiary',
    example: '0987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'Tax ID of the beneficiary',
    example: 'TX-654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: 'Notes about the beneficiary',
    example: 'Updated notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether the beneficiary is active',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
