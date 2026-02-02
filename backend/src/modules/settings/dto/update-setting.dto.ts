import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'Setting value (can be any type)',
    example: { emailNotificationsEnabled: true, fromEmail: 'noreply@company.com' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  value?: Record<string, any>;

  @ApiProperty({
    description: 'Description of this setting',
    example: 'Email notification configuration',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category of the setting',
    example: 'notifications',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Whether this setting is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
