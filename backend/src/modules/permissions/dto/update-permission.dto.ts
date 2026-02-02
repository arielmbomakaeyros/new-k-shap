import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsObject, IsNumber } from 'class-validator';
import { PermissionResource, PermissionAction, PermissionConditionsDto } from './create-permission.dto';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Name of the permission',
    example: 'Create Disbursement',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

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
    required: false,
  })
  @IsEnum(PermissionResource)
  @IsOptional()
  resource?: PermissionResource;

  @ApiProperty({
    description: 'Action this permission allows',
    enum: PermissionAction,
    example: PermissionAction.CREATE,
    required: false,
  })
  @IsEnum(PermissionAction)
  @IsOptional()
  action?: PermissionAction;

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

  @ApiProperty({
    description: 'Whether the permission is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
