import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { PermissionResponseDto } from '../../common/dto/permission-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

class PaginatedPermissionsResponseDto extends PaginatedResponseDto<PermissionResponseDto> {
  @ApiProperty({ type: [PermissionResponseDto] })
  declare data: PermissionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully.',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Permission with this code already exists.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for permission name or code', example: 'disbursement' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource type', example: 'disbursement' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type', example: 'create' })
  @ApiQuery({ name: 'isSystemPermission', required: false, description: 'Filter by system permission status', example: false })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully.',
    type: PaginatedPermissionsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('isSystemPermission') isSystemPermission?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully.',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully.',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
