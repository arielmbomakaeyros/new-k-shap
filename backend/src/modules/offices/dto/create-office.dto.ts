import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOfficeDto {
  @ApiProperty({
    description: 'Name of the office',
    example: 'Headquarters',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique code for the office',
    example: 'HQ-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Street address of the office',
    example: '123 Main Street, Suite 100',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'City where the office is located',
    example: 'Douala',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Country where the office is located',
    example: 'Cameroon',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Phone number of the office',
    example: '+237 123 456 789',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'User ID of the office manager',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  manager?: string;
}
