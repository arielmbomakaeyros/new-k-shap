import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUrl, IsBoolean } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Name of the company',
    example: 'Updated Company Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the company',
    example: 'An updated description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'updated-contact@acme.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Company website URL',
    example: 'https://www.updated-acme.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+1987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Company address',
    example: '456 Updated St, San Francisco, CA 94102',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Whether the company is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}