import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray, IsBoolean, IsDate, IsNumber } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
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
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'System roles assigned to user',
    example: ['admin', 'user'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  systemRoles?: string[];

  @ApiProperty({
    description: 'Roles assigned to user',
    example: ['manager', 'employee'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  roles?: string[];

  @ApiProperty({
    description: 'Departments assigned to user',
    example: ['IT', 'HR'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  departments?: string[];

  @ApiProperty({
    description: 'Offices assigned to user',
    example: ['New York', 'London'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  offices?: string[];

  @ApiProperty({
    description: 'Maximum approval amount for user',
    example: 10000,
    required: false,
  })
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

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the user is verified',
    example: true,
  })
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether the user can login',
    example: true,
  })
  @IsBoolean()
  canLogin: boolean;

  @ApiProperty({
    description: 'Whether the user must change password',
    example: false,
  })
  @IsBoolean()
  mustChangePassword: boolean;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'User deletion timestamp (if deleted)',
    example: null,
    required: false,
  })
  @IsOptional()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Company ID associated with the user',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  company: string;
}