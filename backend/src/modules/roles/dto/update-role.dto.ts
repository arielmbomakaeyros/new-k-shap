import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Updated Admin Role',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Updated administrator role with full access',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Permissions assigned to the role',
    example: ['user.create', 'user.read', 'user.update', 'user.delete', 'role.manage'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiProperty({
    description: 'Whether the role is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}