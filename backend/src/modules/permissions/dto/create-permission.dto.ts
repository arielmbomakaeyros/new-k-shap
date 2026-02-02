import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsObject, IsNumber } from 'class-validator';

export enum PermissionResource {
  DISBURSEMENT = 'disbursement',
  COLLECTION = 'collection',
  DEPARTMENT = 'department',
  OFFICE = 'office',
  DISBURSEMENT_TYPE = 'disbursement_type',
  BENEFICIARY = 'beneficiary',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  REPORT = 'report',
  EXPORT = 'export',
  AUDIT_LOG = 'audit_log',
  CHAT = 'chat',
  NOTIFICATION = 'notification',
  COMPANY_SETTINGS = 'company_settings',
  EMAIL_SETTINGS = 'email_settings',
  REMINDER_SETTINGS = 'reminder_settings',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  VALIDATE = 'validate',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  FORCE_COMPLETE = 'force_complete',
  RESTORE = 'restore',
}

export class PermissionConditionsDto {
  @ApiProperty({
    description: 'Maximum amount limit for this permission',
    example: 1000000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @ApiProperty({
    description: 'Whether permission is restricted to user department',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  departmentRestricted?: boolean;

  @ApiProperty({
    description: 'Whether permission is restricted to user office',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  officeRestricted?: boolean;
}

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Name of the permission',
    example: 'Create Disbursement',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique code for the permission',
    example: 'disbursement.create',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Description of what this permission allows',
    example: 'Allows users to create new disbursement requests',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Resource this permission applies to',
    enum: PermissionResource,
    example: PermissionResource.DISBURSEMENT,
  })
  @IsEnum(PermissionResource)
  @IsNotEmpty()
  resource: PermissionResource;

  @ApiProperty({
    description: 'Action this permission allows',
    enum: PermissionAction,
    example: PermissionAction.CREATE,
  })
  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @ApiProperty({
    description: 'Whether this is a system-level permission',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystemPermission?: boolean;

  @ApiProperty({
    description: 'Conditional restrictions for this permission',
    type: PermissionConditionsDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  conditions?: PermissionConditionsDto;
}
