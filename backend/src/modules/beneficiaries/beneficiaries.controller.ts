import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto';
import { BeneficiaryResponseDto } from '../../common/dto/beneficiary-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

// Define a specific response DTO for paginated beneficiaries
class PaginatedBeneficiariesResponseDto extends PaginatedResponseDto<BeneficiaryResponseDto> {
  @ApiProperty({ type: [BeneficiaryResponseDto] })
  declare data: BeneficiaryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Beneficiaries')
@Controller('beneficiaries')
@ApiBearerAuth()
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new beneficiary' })
  @ApiBody({ type: CreateBeneficiaryDto })
  @ApiResponse({
    status: 201,
    description: 'Beneficiary created successfully.',
    type: BeneficiaryResponseDto
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
  create(@Body() createBeneficiaryDto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(createBeneficiaryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all beneficiaries' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', example: 'john' })
  @ApiResponse({
    status: 200,
    description: 'List of beneficiaries retrieved successfully.',
    type: PaginatedBeneficiariesResponseDto
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
    return this.beneficiariesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get beneficiary by ID' })
  @ApiParam({ name: 'id', description: 'Beneficiary ID' })
  @ApiResponse({
    status: 200,
    description: 'Beneficiary retrieved successfully.',
    type: BeneficiaryResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Beneficiary not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Beneficiary not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.beneficiariesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update beneficiary by ID' })
  @ApiParam({ name: 'id', description: 'Beneficiary ID' })
  @ApiBody({ type: UpdateBeneficiaryDto })
  @ApiResponse({
    status: 200,
    description: 'Beneficiary updated successfully.',
    type: BeneficiaryResponseDto
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
    description: 'Beneficiary not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Beneficiary not found',
        error: 'Not Found'
      }
    }
  })
  update(@Param('id') id: string, @Body() updateBeneficiaryDto: UpdateBeneficiaryDto) {
    return this.beneficiariesService.update(id, updateBeneficiaryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete beneficiary by ID' })
  @ApiParam({ name: 'id', description: 'Beneficiary ID' })
  @ApiResponse({
    status: 200,
    description: 'Beneficiary deleted successfully.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Beneficiary not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Beneficiary not found',
        error: 'Not Found'
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.beneficiariesService.remove(id);
  }
}
