import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

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

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Notification preferences for the user',
    example: {
      email: true,
      inApp: true,
      disbursementCreated: true,
      disbursementValidated: false,
      disbursementRejected: true,
      disbursementCompleted: true,
      chatMessages: true,
      systemAlerts: true,
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  notificationPreferences?: {
    email?: boolean;
    inApp?: boolean;
    disbursementCreated?: boolean;
    disbursementValidated?: boolean;
    disbursementRejected?: boolean;
    disbursementCompleted?: boolean;
    chatMessages?: boolean;
    systemAlerts?: boolean;
  };
}
