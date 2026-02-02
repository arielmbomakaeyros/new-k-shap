import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@ApiTags('Companies')
@Controller('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Acme Corporation',
        description: 'A leading technology company',
        email: 'contact@acme.com',
        website: 'https://www.acme.com',
        phone: '+1234567890',
        address: '123 Main St, New York, NY 10001',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name or email', example: 'acme' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiResponse({
    status: 200,
    description: 'List of companies retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Acme Corporation',
            description: 'A leading technology company',
            email: 'contact@acme.com',
            website: 'https://www.acme.com',
            phone: '+1234567890',
            address: '123 Main St, New York, NY 10001',
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
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company retrieved successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Acme Corporation',
        description: 'A leading technology company',
        email: 'contact@acme.com',
        website: 'https://www.acme.com',
        phone: '+1234567890',
        address: '123 Main St, New York, NY 10001',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Updated Acme Corporation',
        description: 'An updated technology company',
        email: 'updated@acme.com',
        website: 'https://www.updated-acme.com',
        phone: '+1987654321',
        address: '456 Updated St, San Francisco, CA 94102',
        isActive: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully.',
    schema: {
      example: {
        success: true,
        message: 'Company deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
