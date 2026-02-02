import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty({
    description: 'Title of the chat/conversation',
    example: 'Updated Project Discussion',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Participants in the chat',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  participants?: string[];

  @ApiProperty({
    description: 'Whether the chat is archived',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiProperty({
    description: 'Whether the chat is pinned',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}