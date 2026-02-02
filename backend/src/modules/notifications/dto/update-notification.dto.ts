import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { NotificationType, NotificationChannel } from './create-notification.dto';

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Title of the notification',
    example: 'Updated Payment Received',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Content/body of the notification',
    example: 'Your updated payment of $1000 has been received successfully.',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.SUCCESS,
    required: false,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    description: 'Channel to send the notification',
    enum: NotificationChannel,
    example: NotificationChannel.IN_APP,
    required: false,
  })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiProperty({
    description: 'Recipient ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  recipientId?: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({
    description: 'Additional metadata for the notification',
    example: { paymentId: '12345', amount: 1000 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}