import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto, UpdateChatDto } from './dto';
import { ChatResponseDto } from '../../common/dto/chat-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

// Define a specific response DTO for paginated chats
class PaginatedChatsResponseDto extends PaginatedResponseDto<ChatResponseDto> {
  @ApiProperty({ type: [ChatResponseDto] })
  declare data: ChatResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: 201,
    description: 'Chat created successfully.',
    type: ChatResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', example: 'project' })
  @ApiQuery({ name: 'participantId', required: false, description: 'Filter by participant ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'isGroup', required: false, description: 'Filter by group status', example: true })
  @ApiQuery({ name: 'isArchived', required: false, description: 'Filter by archived status', example: false })
  @ApiQuery({ name: 'isPinned', required: false, description: 'Filter by pinned status', example: true })
  @ApiResponse({
    status: 200,
    description: 'List of chats retrieved successfully.',
    type: PaginatedChatsResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden'
      }
    }
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('participantId') participantId?: string,
    @Query('isGroup') isGroup?: string,
    @Query('isArchived') isArchived?: string,
    @Query('isPinned') isPinned?: string,
  ) {
    return this.chatService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat by ID' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat retrieved successfully.',
    type: ChatResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Chat not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Chat not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update chat by ID' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiBody({ type: UpdateChatDto })
  @ApiResponse({
    status: 200,
    description: 'Chat updated successfully.',
    type: ChatResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Chat not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Chat not found',
        error: 'Not Found'
      }
    }
  })
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete chat by ID' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat deleted successfully.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Chat not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Chat not found',
        error: 'Not Found'
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
