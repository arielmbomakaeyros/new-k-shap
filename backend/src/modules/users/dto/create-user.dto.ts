import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

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
    description: 'Roles assigned to user',
    example: ['manager', 'employee'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  roles?: string[];

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

  @ApiProperty({
    description: 'Maximum approval amount for user',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxApprovalAmount?: number;

  @ApiProperty({
    description: 'Preferred language for user',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}
