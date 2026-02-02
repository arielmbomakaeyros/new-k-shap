import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  SMS = 'sms',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Title of the notification',
    example: 'Payment Received',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Content/body of the notification',
    example: 'Your payment of $1000 has been received successfully.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.INFO,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'Channel to send the notification',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Recipient ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({
    description: 'Additional metadata for the notification',
    example: { paymentId: '12345', amount: 1000 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}