import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsDate, IsBoolean, IsOptional } from 'class-validator';

export class ChatResponseDto {
  @ApiProperty({
    description: 'Chat ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Title of the chat/conversation',
    example: 'Project Discussion',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Participants in the chat',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsArray()
  participants: string[];

  @ApiProperty({
    description: 'Whether the chat is a group chat',
    example: true,
  })
  @IsBoolean()
  isGroup: boolean;

  @ApiProperty({
    description: 'Whether the chat is archived',
    example: false,
  })
  @IsBoolean()
  isArchived: boolean;

  @ApiProperty({
    description: 'Whether the chat is pinned',
    example: true,
  })
  @IsBoolean()
  isPinned: boolean;

  @ApiProperty({
    description: 'Chat creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Chat last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Timestamp when the chat was last read',
    example: '2023-01-02T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  lastReadAt?: Date;

  @ApiProperty({
    description: 'ID of the last message in the chat',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastMessageId?: string;

  @ApiProperty({
    description: 'Content of the last message',
    example: 'See you tomorrow!',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastMessageContent?: string;

  @ApiProperty({
    description: 'Timestamp of the last message',
    example: '2023-01-02T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  lastMessageAt?: Date;
}