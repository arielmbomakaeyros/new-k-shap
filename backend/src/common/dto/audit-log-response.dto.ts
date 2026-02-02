import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { AuditAction, ResourceType } from '../../modules/audit-logs/dto/create-audit-log.dto';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Audit log ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Action performed',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({
    description: 'Resource type that was affected',
    enum: ResourceType,
    example: ResourceType.USER,
  })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({
    description: 'ID of the resource that was affected',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: 'IP address from which the action was performed',
    example: '192.168.1.1',
  })
  @IsString()
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

  @ApiProperty({
    description: 'Audit log creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Audit log last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}