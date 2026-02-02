import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsArray, IsNumber } from 'class-validator';

export class EmailNotificationSettingDto {
  @ApiProperty({ description: 'Whether this notification is enabled', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'List of recipient emails', example: ['admin@example.com'], required: false })
  @IsArray()
  @IsOptional()
  recipients?: string[];

  @ApiProperty({ description: 'CC emails', example: ['manager@example.com'], required: false })
  @IsArray()
  @IsOptional()
  cc?: string[];
}

export class CreateSettingDto {
  @ApiProperty({
    description: 'Setting key/name',
    example: 'email_settings',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Setting value (can be any type)',
    example: { emailNotificationsEnabled: true, fromEmail: 'noreply@company.com' },
  })
  @IsObject()
  @IsNotEmpty()
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
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystemSetting?: boolean;
}

export class UpdateEmailSettingsDto {
  @ApiProperty({
    description: 'Whether email notifications are enabled globally',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  emailNotificationsEnabled?: boolean;

  @ApiProperty({
    description: 'Email footer text',
    example: 'Powered by K-Shap',
    required: false,
  })
  @IsString()
  @IsOptional()
  emailFooter?: string;

  @ApiProperty({
    description: 'Logo URL for email header',
    example: 'https://storage.example.com/logos/company-logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  emailHeaderLogoUrl?: string;

  @ApiProperty({
    description: 'From email address',
    example: 'noreply@company.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromEmail?: string;

  @ApiProperty({
    description: 'From name',
    example: 'K-Shap Notifications',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromName?: string;

  @ApiProperty({
    description: 'Notification settings for various events',
    example: {
      disbursementCreated: { enabled: true, recipients: ['admin@example.com'] },
      disbursementCompleted: { enabled: true, recipients: ['finance@example.com'] },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  notifications?: Record<string, EmailNotificationSettingDto>;
}

export class UpdateReminderSettingsDto {
  @ApiProperty({
    description: 'Whether reminders are enabled globally',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  remindersEnabled?: boolean;

  @ApiProperty({
    description: 'Reminder intervals in minutes',
    example: [2880, 1440, 180, 45, 15],
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  reminderIntervals?: number[];

  @ApiProperty({
    description: 'Recipient roles for different pending states',
    example: {
      pendingDeptHead: ['department_head'],
      pendingValidator: ['validator'],
      pendingCashier: ['cashier'],
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  recipientRoles?: Record<string, string[]>;

  @ApiProperty({
    description: 'Whether to send email reminders',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  emailReminders?: boolean;

  @ApiProperty({
    description: 'Whether to send in-app reminders',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  inAppReminders?: boolean;

  @ApiProperty({
    description: 'Whether to send SMS reminders',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  smsReminders?: boolean;
}
