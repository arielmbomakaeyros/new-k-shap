import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsNumber } from 'class-validator';

export class OfficeResponseDto {
  @ApiProperty({
    description: 'Office ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Company ID this office belongs to',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Name of the office',
    example: 'Headquarters',
  })
  @IsString()
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
    description: 'Office manager details (populated)',
    example: { _id: '507f1f77bcf86cd799439011', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    required: false,
  })
  @IsOptional()
  manager?: any;

  @ApiProperty({
    description: 'Number of users assigned to this office',
    example: 15,
  })
  @IsNumber()
  userCount: number;

  @ApiProperty({
    description: 'Whether the office is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the office is soft deleted',
    example: false,
  })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({
    description: 'Office creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Office last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}
