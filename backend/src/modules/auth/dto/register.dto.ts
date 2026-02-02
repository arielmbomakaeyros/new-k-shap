import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Company ID',
    example: 'company123',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    description: 'System roles assigned to user',
    example: ['admin', 'user'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  systemRoles?: string[];

  @ApiProperty({
    description: 'Departments assigned to user',
    example: ['IT', 'HR'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  departments?: string[];

  @ApiProperty({
    description: 'Offices assigned to user',
    example: ['New York', 'London'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  offices?: string[];
}
