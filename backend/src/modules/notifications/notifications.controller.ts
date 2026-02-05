import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { NotificationResponseDto } from '../../common/dto/notification-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Define a specific response DTO for paginated notifications
class PaginatedNotificationsResponseDto extends PaginatedResponseDto<NotificationResponseDto> {
  @ApiProperty({ type: [NotificationResponseDto] })
  declare data: NotificationResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully.',
    type: NotificationResponseDto
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
  create(@Body() createNotificationDto: CreateNotificationDto, @CurrentUser() user: any) {
    const companyId = user?.company ? (user.company._id || user.company).toString() : null;
    return this.notificationsService.create(createNotificationDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', example: 'payment' })
  @ApiQuery({ name: 'recipientId', required: false, description: 'Filter by recipient ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type', example: 'info' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by notification channel', example: 'email' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status', example: false })
  @ApiResponse({
    status: 200,
    description: 'List of notifications retrieved successfully.',
    type: PaginatedNotificationsResponseDto
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
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('recipientId') recipientId?: string,
    @Query('type') type?: string,
    @Query('channel') channel?: string,
    @Query('isRead') isRead?: string,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.notificationsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully.',
    type: NotificationResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notification not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.notificationsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully.',
    type: NotificationResponseDto
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
    description: 'Notification not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notification not found',
        error: 'Not Found'
      }
    }
  })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.notificationsService.update(id, updateNotificationDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notification not found',
        error: 'Not Found'
      }
    }
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.notificationsService.remove(id, companyId);
  }
}
