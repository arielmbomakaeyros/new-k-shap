import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin',
        description: 'Administrator role with full access',
        permissions: ['user.create', 'user.read', 'user.update', 'user.delete'],
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for role name', example: 'admin' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Admin',
            description: 'Administrator role with full access',
            permissions: ['user.create', 'user.read', 'user.update', 'user.delete'],
            isActive: true,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin',
        description: 'Administrator role with full access',
        permissions: ['user.create', 'user.read', 'user.update', 'user.delete'],
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Updated Admin Role',
        description: 'Updated administrator role with full access',
        permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'role.manage'],
        isActive: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully.',
    schema: {
      example: {
        success: true,
        message: 'Role deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
