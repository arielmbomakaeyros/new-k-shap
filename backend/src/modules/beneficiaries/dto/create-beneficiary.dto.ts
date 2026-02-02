import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateBeneficiaryDto {
  @ApiProperty({
    description: 'First name of the beneficiary',
    example: 'Jane',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the beneficiary',
    example: 'Smith',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the beneficiary',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the beneficiary',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Account number of the beneficiary',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'Bank name of the beneficiary',
    example: 'Example Bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({
    description: 'Whether the beneficiary is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}