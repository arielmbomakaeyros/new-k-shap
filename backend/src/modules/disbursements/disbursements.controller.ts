import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { DisbursementsService } from './disbursements.service';
import { CreateDisbursementDto, UpdateDisbursementDto, DisbursementStatus, PaymentType, DisbursementPriority } from './dto';
import { DisbursementResponseDto } from '../../common/dto/disbursement-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

class PaginatedDisbursementsResponseDto extends PaginatedResponseDto<DisbursementResponseDto> {
  @ApiProperty({ type: [DisbursementResponseDto] })
  declare data: DisbursementResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Disbursements')
@Controller('disbursements')
@ApiBearerAuth()
export class DisbursementsController {
  constructor(private readonly disbursementsService: DisbursementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new disbursement' })
  @ApiBody({ type: CreateDisbursementDto })
  @ApiResponse({
    status: 201,
    description: 'Disbursement created successfully.',
    type: DisbursementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  create(@Body() createDisbursementDto: CreateDisbursementDto) {
    return this.disbursementsService.create(createDisbursementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all disbursements with filtering, sorting, and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for reference number or description', example: 'DIS-2024' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: DisbursementStatus, example: 'pending_validator' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'office', required: false, description: 'Filter by office ID', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'beneficiary', required: false, description: 'Filter by beneficiary ID', example: '507f1f77bcf86cd799439013' })
  @ApiQuery({ name: 'disbursementType', required: false, description: 'Filter by disbursement type ID', example: '507f1f77bcf86cd799439014' })
  @ApiQuery({ name: 'paymentMethod', required: false, description: 'Filter by payment method', enum: PaymentType, example: 'bank_transfer' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority', enum: DisbursementPriority, example: 'high' })
  @ApiQuery({ name: 'isUrgent', required: false, description: 'Filter by urgent flag', example: true })
  @ApiQuery({ name: 'isRetroactive', required: false, description: 'Filter by retroactive flag', example: false })
  @ApiQuery({ name: 'isCompleted', required: false, description: 'Filter by completion status', example: false })
  @ApiQuery({ name: 'minAmount', required: false, description: 'Minimum amount filter', example: 10000 })
  @ApiQuery({ name: 'maxAmount', required: false, description: 'Maximum amount filter', example: 1000000 })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by creation date (from)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by creation date (to)', example: '2024-12-31' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)', example: 'supplies,procurement' })
  @ApiResponse({
    status: 200,
    description: 'List of disbursements retrieved successfully.',
    type: PaginatedDisbursementsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('office') office?: string,
    @Query('beneficiary') beneficiary?: string,
    @Query('disbursementType') disbursementType?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('priority') priority?: string,
    @Query('isUrgent') isUrgent?: string,
    @Query('isRetroactive') isRetroactive?: string,
    @Query('isCompleted') isCompleted?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tags') tags?: string,
  ) {
    return this.disbursementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get disbursement by ID with all populated references' })
  @ApiParam({ name: 'id', description: 'Disbursement ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Disbursement retrieved successfully with populated beneficiary, department, office, and disbursement type.',
    type: DisbursementResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Disbursement not found.' })
  findOne(@Param('id') id: string) {
    return this.disbursementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update disbursement by ID' })
  @ApiParam({ name: 'id', description: 'Disbursement ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateDisbursementDto })
  @ApiResponse({
    status: 200,
    description: 'Disbursement updated successfully.',
    type: DisbursementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify disbursement in current status.' })
  @ApiResponse({ status: 404, description: 'Disbursement not found.' })
  update(@Param('id') id: string, @Body() updateDisbursementDto: UpdateDisbursementDto) {
    return this.disbursementsService.update(id, updateDisbursementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete disbursement by ID (soft delete)' })
  @ApiParam({ name: 'id', description: 'Disbursement ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Disbursement deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete disbursement in current status.' })
  @ApiResponse({ status: 404, description: 'Disbursement not found.' })
  remove(@Param('id') id: string) {
    return this.disbursementsService.remove(id);
  }
}
