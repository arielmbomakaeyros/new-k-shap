import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsObject } from 'class-validator';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'Permission ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Company ID this permission belongs to',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Name of the permission',
    example: 'Create Disbursement',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unique code for the permission',
    example: 'disbursement.create',
  })
  @IsString()
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
    example: 'disbursement',
  })
  @IsString()
  resource: string;

  @ApiProperty({
    description: 'Action this permission allows',
    example: 'create',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Whether this is a system-level permission',
    example: false,
  })
  @IsBoolean()
  isSystemPermission: boolean;

  @ApiProperty({
    description: 'Conditional restrictions for this permission',
    example: { maxAmount: 1000000, departmentRestricted: true, officeRestricted: false },
    required: false,
  })
  @IsObject()
  @IsOptional()
  conditions?: {
    maxAmount?: number;
    departmentRestricted?: boolean;
    officeRestricted?: boolean;
  };

  @ApiProperty({
    description: 'Whether the permission is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the permission is soft deleted',
    example: false,
  })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({
    description: 'Permission creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Permission last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}
