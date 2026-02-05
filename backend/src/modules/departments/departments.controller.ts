import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Departments')
@Controller('departments')
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Information Technology',
        description: 'Handles all IT infrastructure and development',
        companyId: '507f1f77bcf86cd799439012',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createDepartmentDto: CreateDepartmentDto, @CurrentUser() user: any) {
    const companyId = user?.company ? (user.company._id || user.company).toString() : createDepartmentDto.companyId;
    const { companyId: _companyId, headId, ...rest } = createDepartmentDto as any;

    return this.departmentsService.create({
      ...rest,
      ...(companyId ? { company: companyId } : {}),
      ...(headId ? { head: headId } : {}),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for department name', example: 'IT' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiResponse({
    status: 200,
    description: 'List of departments retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Information Technology',
            description: 'Handles all IT infrastructure and development',
            companyId: '507f1f77bcf86cd799439012',
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
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.departmentsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Information Technology',
        description: 'Handles all IT infrastructure and development',
        companyId: '507f1f77bcf86cd799439012',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.departmentsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Updated Information Technology',
        description: 'Handles all updated IT infrastructure and development',
        companyId: '507f1f77bcf86cd799439012',
        isActive: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.departmentsService.update(id, updateDepartmentDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department deleted successfully.',
    schema: {
      example: {
        success: true,
        message: 'Department deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.departmentsService.remove(id, companyId);
  }
}
