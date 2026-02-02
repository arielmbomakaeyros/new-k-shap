import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsObject } from 'class-validator';

export class SettingResponseDto {
  @ApiProperty({
    description: 'Setting ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Setting key/name',
    example: 'email_settings',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Setting value',
    example: { emailNotificationsEnabled: true, fromEmail: 'noreply@company.com' },
  })
  @IsObject()
  value: Record<string, any>;

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
    description: 'Whether this is a system-level setting',
    example: false,
  })
  @IsBoolean()
  isSystemSetting: boolean;

  @ApiProperty({
    description: 'Whether this setting is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}

export class EmailSettingsResponseDto {
  @ApiProperty({ description: 'Setting ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Company ID', example: '507f1f77bcf86cd799439012' })
  company: string;

  @ApiProperty({ description: 'Whether email notifications are enabled globally', example: true })
  emailNotificationsEnabled: boolean;

  @ApiProperty({
    description: 'Notification settings for various events',
    example: {
      disbursementCreated: { enabled: true, recipients: ['admin@example.com'], cc: [] },
      disbursementCompleted: { enabled: true, recipients: ['finance@example.com'], cc: [] },
    },
  })
  notifications: Record<string, any>;

  @ApiProperty({ description: 'Email footer text', example: 'Powered by K-Shap', required: false })
  emailFooter?: string;

  @ApiProperty({ description: 'Logo URL for email header', required: false })
  emailHeaderLogoUrl?: string;

  @ApiProperty({ description: 'From email address', example: 'noreply@company.com', required: false })
  fromEmail?: string;

  @ApiProperty({ description: 'From name', example: 'K-Shap Notifications', required: false })
  fromName?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class ReminderSettingsResponseDto {
  @ApiProperty({ description: 'Setting ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'Company ID', example: '507f1f77bcf86cd799439012' })
  company: string;

  @ApiProperty({ description: 'Whether reminders are enabled globally', example: true })
  remindersEnabled: boolean;

  @ApiProperty({ description: 'Reminder intervals in minutes', example: [2880, 1440, 180, 45, 15] })
  reminderIntervals: number[];

  @ApiProperty({
    description: 'Recipient roles for different pending states',
    example: { pendingDeptHead: ['department_head'], pendingValidator: ['validator'], pendingCashier: ['cashier'] },
  })
  recipientRoles: Record<string, string[]>;

  @ApiProperty({ description: 'Whether to send email reminders', example: true })
  emailReminders: boolean;

  @ApiProperty({ description: 'Whether to send in-app reminders', example: true })
  inAppReminders: boolean;

  @ApiProperty({ description: 'Whether to send SMS reminders', example: false })
  smsReminders: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
