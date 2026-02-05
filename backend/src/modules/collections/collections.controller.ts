import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto, PaymentType } from './dto';
import { CollectionResponseDto } from '../../common/dto/collection-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class PaginatedCollectionsResponseDto extends PaginatedResponseDto<CollectionResponseDto> {
  @ApiProperty({ type: [CollectionResponseDto] })
  declare data: CollectionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Collections')
@Controller('collections')
@ApiBearerAuth()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new collection/revenue entry' })
  @ApiBody({ type: CreateCollectionDto })
  @ApiResponse({
    status: 201,
    description: 'Collection created successfully.',
    type: CollectionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCollectionDto: CreateCollectionDto, @CurrentUser() user: any) {
    const companyId = user?.company ? (user.company._id || user.company).toString() : null;
    return this.collectionsService.create(createCollectionDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all collections with filtering, sorting, and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'collectionDate' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for reference number, buyer name, or company name', example: 'Kamga' })
  @ApiQuery({ name: 'paymentType', required: false, description: 'Filter by payment type', enum: PaymentType, example: 'cash' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'office', required: false, description: 'Filter by office ID', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'handledBy', required: false, description: 'Filter by handler user ID', example: '507f1f77bcf86cd799439013' })
  @ApiQuery({ name: 'isFullyPaid', required: false, description: 'Filter by payment completion status', example: false })
  @ApiQuery({ name: 'revenueCategory', required: false, description: 'Filter by revenue category', example: 'Sales Revenue' })
  @ApiQuery({ name: 'activityType', required: false, description: 'Filter by activity type', example: 'Product Sale' })
  @ApiQuery({ name: 'minAmount', required: false, description: 'Minimum amount filter', example: 10000 })
  @ApiQuery({ name: 'maxAmount', required: false, description: 'Maximum amount filter', example: 1000000 })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by collection date (from)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by collection date (to)', example: '2024-12-31' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)', example: 'retail,electronics' })
  @ApiQuery({ name: 'projectReference', required: false, description: 'Filter by project reference', example: 'PROJ-2024-001' })
  @ApiQuery({ name: 'contractReference', required: false, description: 'Filter by contract reference', example: 'CONTRACT-2024-001' })
  @ApiResponse({
    status: 200,
    description: 'List of collections retrieved successfully.',
    type: PaginatedCollectionsResponseDto,
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
    @Query('paymentType') paymentType?: string,
    @Query('department') department?: string,
    @Query('office') office?: string,
    @Query('handledBy') handledBy?: string,
    @Query('isFullyPaid') isFullyPaid?: string,
    @Query('revenueCategory') revenueCategory?: string,
    @Query('activityType') activityType?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tags') tags?: string,
    @Query('projectReference') projectReference?: string,
    @Query('contractReference') contractReference?: string,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.collectionsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID with all populated references' })
  @ApiParam({ name: 'id', description: 'Collection ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Collection retrieved successfully with populated department, office, and handler.',
    type: CollectionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.collectionsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update collection by ID' })
  @ApiParam({ name: 'id', description: 'Collection ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateCollectionDto })
  @ApiResponse({
    status: 200,
    description: 'Collection updated successfully.',
    type: CollectionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.collectionsService.update(id, updateCollectionDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete collection by ID (soft delete)' })
  @ApiParam({ name: 'id', description: 'Collection ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Collection deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.collectionsService.remove(id, companyId);
  }
}
