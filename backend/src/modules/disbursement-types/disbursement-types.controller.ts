import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { DisbursementTypesService } from './disbursement-types.service';
import { CreateDisbursementTypeDto, UpdateDisbursementTypeDto } from './dto';
import { DisbursementTypeResponseDto } from '../../common/dto/disbursement-type-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

// Define a specific response DTO for paginated disbursement types
class PaginatedDisbursementTypesResponseDto extends PaginatedResponseDto<DisbursementTypeResponseDto> {
  @ApiProperty({ type: [DisbursementTypeResponseDto] })
  declare data: DisbursementTypeResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Disbursement Types')
@Controller('disbursement-types')
@ApiBearerAuth()
export class DisbursementTypesController {
  constructor(private readonly disbursementTypesService: DisbursementTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new disbursement type' })
  @ApiBody({ type: CreateDisbursementTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Disbursement type created successfully.',
    type: DisbursementTypeResponseDto
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
  create(@Body() createDisbursementTypeDto: CreateDisbursementTypeDto) {
    return this.disbursementTypesService.create(createDisbursementTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all disbursement types' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', example: 'salary' })
  @ApiResponse({
    status: 200,
    description: 'List of disbursement types retrieved successfully.',
    type: PaginatedDisbursementTypesResponseDto
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
  ) {
    return this.disbursementTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get disbursement type by ID' })
  @ApiParam({ name: 'id', description: 'Disbursement type ID' })
  @ApiResponse({
    status: 200,
    description: 'Disbursement type retrieved successfully.',
    type: DisbursementTypeResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Disbursement type not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Disbursement type not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.disbursementTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update disbursement type by ID' })
  @ApiParam({ name: 'id', description: 'Disbursement type ID' })
  @ApiBody({ type: UpdateDisbursementTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Disbursement type updated successfully.',
    type: DisbursementTypeResponseDto
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
    description: 'Disbursement type not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Disbursement type not found',
        error: 'Not Found'
      }
    }
  })
  update(@Param('id') id: string, @Body() updateDisbursementTypeDto: UpdateDisbursementTypeDto) {
    return this.disbursementTypesService.update(id, updateDisbursementTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete disbursement type by ID' })
  @ApiParam({ name: 'id', description: 'Disbursement type ID' })
  @ApiResponse({
    status: 200,
    description: 'Disbursement type deleted successfully.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Disbursement type not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Disbursement type not found',
        error: 'Not Found'
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.disbursementTypesService.remove(id);
  }
}
