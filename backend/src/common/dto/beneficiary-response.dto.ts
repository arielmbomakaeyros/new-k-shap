import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class BeneficiaryResponseDto {
  @ApiProperty({
    description: 'Beneficiary ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'First name of the beneficiary',
    example: 'Jane',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the beneficiary',
    example: 'Smith',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the beneficiary',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
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
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Beneficiary creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Beneficiary last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}