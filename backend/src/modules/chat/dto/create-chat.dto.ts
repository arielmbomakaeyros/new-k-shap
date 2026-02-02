import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Title of the chat/conversation',
    example: 'Project Discussion',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Participants in the chat',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  participants: string[];

  @ApiProperty({
    description: 'Initial message in the chat',
    example: 'Hello everyone, let\'s discuss the project',
    required: false,
  })
  @IsString()
  @IsOptional()
  initialMessage?: string;

  @ApiProperty({
    description: 'Whether the chat is a group chat',
    example: true,
    required: false,
  })
  @IsOptional()
  isGroup?: boolean;
}