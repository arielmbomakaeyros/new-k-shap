import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsIn, IsMongoId } from 'class-validator';

export class CreateBeneficiaryDto {
  @ApiProperty({
    description: 'Beneficiary name',
    example: 'Supermonth',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
  })
  @IsMongoId()
  @IsNotEmpty()
  disbursementType: string;

  @ApiProperty({
    description: 'Email address of the beneficiary',
    example: 'jane.smith@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number of the beneficiary',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Address of the beneficiary',
    example: '123 Main Street',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Bank name of the beneficiary',
    example: 'Example Bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({
    description: 'Account number of the beneficiary',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'Tax ID of the beneficiary',
    example: 'TX-123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: 'Notes about the beneficiary',
    example: 'Preferred supplier',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether the beneficiary is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
