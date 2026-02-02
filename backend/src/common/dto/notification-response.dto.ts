import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { NotificationType, NotificationChannel } from '../../modules/notifications/dto/create-notification.dto';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Payment Received',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Content/body of the notification',
    example: 'Your payment of $1000 has been received successfully.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.INFO,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Channel to send the notification',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Recipient ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  recipientId: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  @IsBoolean()
  isRead: boolean;

  @ApiProperty({
    description: 'Whether the notification has been delivered',
    example: true,
  })
  @IsBoolean()
  isDelivered: boolean;

  @ApiProperty({
    description: 'Additional metadata for the notification',
    example: { paymentId: '12345', amount: 1000 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Notification creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Notification last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Notification read timestamp (if read)',
    example: '2023-01-02T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  readAt?: Date;
}