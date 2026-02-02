import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class UpdateBeneficiaryDto {
  @ApiProperty({
    description: 'First name of the beneficiary',
    example: 'Updated Jane',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the beneficiary',
    example: 'Updated Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

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
    description: 'Account number of the beneficiary',
    example: '0987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'Bank name of the beneficiary',
    example: 'Updated Bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({
    description: 'Whether the beneficiary is active',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}