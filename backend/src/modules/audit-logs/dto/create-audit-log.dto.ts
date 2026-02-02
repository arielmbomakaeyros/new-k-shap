import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
}

export enum ResourceType {
  USER = 'USER',
  COMPANY = 'COMPANY',
  ROLE = 'ROLE',
  DEPARTMENT = 'DEPARTMENT',
  DISBURSEMENT = 'DISBURSEMENT',
  BENEFICIARY = 'BENEFICIARY',
  NOTIFICATION = 'NOTIFICATION',
  CHAT = 'CHAT',
  FILE = 'FILE',
}

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'User ID who performed the action',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Action performed',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @ApiProperty({
    description: 'Resource type that was affected',
    enum: ResourceType,
    example: ResourceType.USER,
  })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resourceType: ResourceType;

  @ApiProperty({
    description: 'ID of the resource that was affected',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'IP address from which the action was performed',
    example: '192.168.1.1',
  })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({
    description: 'Additional metadata about the action',
    example: { oldValue: {}, newValue: { name: 'John Doe' } },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}