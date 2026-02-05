import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto';
import { AuditLogResponseDto } from '../../common/dto/audit-log-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Define a specific response DTO for paginated audit logs
class PaginatedAuditLogsResponseDto extends PaginatedResponseDto<AuditLogResponseDto> {
  @ApiProperty({ type: [AuditLogResponseDto] })
  declare data: AuditLogResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new audit log (typically called internally)' })
  @ApiBody({ type: CreateAuditLogDto })
  @ApiResponse({
    status: 201,
    description: 'Audit log created successfully.',
    type: AuditLogResponseDto
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
  create(@Body() createAuditLogDto: CreateAuditLogDto, @CurrentUser() user: any) {
    const companyId = user?.company ? (user.company._id || user.company).toString() : null;
    return this.auditLogsService.create(createAuditLogDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', example: 'user' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type', example: 'CREATE' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type', example: 'USER' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date', example: '2023-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date', example: '2023-12-31' })
  @ApiResponse({
    status: 200,
    description: 'List of audit logs retrieved successfully.',
    type: PaginatedAuditLogsResponseDto
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
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.auditLogsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully.',
    type: AuditLogResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Audit log not found',
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
    return this.auditLogsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update audit log by ID (not typically used for audit logs)' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({
    status: 405,
    description: 'Method Not Allowed - Audit logs are typically immutable.',
    schema: {
      example: {
        statusCode: 405,
        message: 'Method Not Allowed',
        error: 'Method Not Allowed'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateAuditLogDto: any, @CurrentUser() user: any) {
    // Audit logs are typically immutable, so this would return a 405 Method Not Allowed
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.auditLogsService.update(id, updateAuditLogDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete audit log by ID (not typically allowed for audit logs)' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({
    status: 405,
    description: 'Method Not Allowed - Audit logs are typically immutable.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    // Audit logs are typically immutable and not deletable, so this would return a 405 Method Not Allowed
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.auditLogsService.remove(id, companyId);
  }
}
