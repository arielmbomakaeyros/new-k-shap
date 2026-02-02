import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Name of the company',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the company',
    example: 'A leading technology company',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'contact@acme.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Company website URL',
    example: 'https://www.acme.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Main St, New York, NY 10001',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}