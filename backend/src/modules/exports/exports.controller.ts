import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExportsService } from './exports.service';
import { CreateExportDto, ExportType, ExportFormat } from './dto';
import { ExportResponseDto } from '../../common/dto/export-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

class PaginatedExportsResponseDto extends PaginatedResponseDto<ExportResponseDto> {
  @ApiProperty({ type: [ExportResponseDto] })
  declare data: ExportResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Exports')
@Controller('exports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new data export' })
  @ApiBody({ type: CreateExportDto })
  @ApiResponse({
    status: 201,
    description: 'Export job created successfully. The export will be processed asynchronously.',
    type: ExportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid export configuration.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createExportDto: CreateExportDto) {
    return this.exportsService.create(createExportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exports for the company' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by export type', enum: ExportType, example: 'disbursements' })
  @ApiQuery({ name: 'format', required: false, description: 'Filter by export format', enum: ExportFormat, example: 'excel' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by export status', example: 'completed' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by creation date (from)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by creation date (to)', example: '2024-12-31' })
  @ApiResponse({
    status: 200,
    description: 'List of exports retrieved successfully.',
    type: PaginatedExportsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('type') type?: string,
    @Query('format') format?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export by ID' })
  @ApiParam({ name: 'id', description: 'Export ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Export retrieved successfully.',
    type: ExportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Export not found.' })
  findOne(@Param('id') id: string) {
    return this.exportsService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for an export' })
  @ApiParam({ name: 'id', description: 'Export ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Download URL retrieved successfully.',
    schema: {
      example: {
        downloadUrl: 'https://storage.example.com/exports/export-123.xlsx?token=abc123',
        expiresAt: '2024-01-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Export not found.' })
  @ApiResponse({ status: 409, description: 'Export not yet completed.' })
  getDownloadUrl(@Param('id') id: string) {
    return this.exportsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete export by ID' })
  @ApiParam({ name: 'id', description: 'Export ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Export deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Export not found.' })
  remove(@Param('id') id: string) {
    return this.exportsService.remove(id);
  }
}
