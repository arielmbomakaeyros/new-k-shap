import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { OfficesService } from './offices.service';
import { CreateOfficeDto, UpdateOfficeDto } from './dto';
import { OfficeResponseDto } from '../../common/dto/office-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class PaginatedOfficesResponseDto extends PaginatedResponseDto<OfficeResponseDto> {
  @ApiProperty({ type: [OfficeResponseDto] })
  declare data: OfficeResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Offices')
@Controller('offices')
@ApiBearerAuth()
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new office' })
  @ApiBody({ type: CreateOfficeDto })
  @ApiResponse({
    status: 201,
    description: 'Office created successfully.',
    type: OfficeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createOfficeDto: CreateOfficeDto, @CurrentUser() user: any) {
    const companyId = user?.company ? (user.company._id || user.company).toString() : createOfficeDto.companyId;
    const { companyId: _companyId, location, ...rest } = createOfficeDto as any;

    return this.officesService.create({
      ...rest,
      ...(companyId ? { company: companyId } : {}),
      ...(location && !rest.city ? { city: location } : {}),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all offices' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for office name or code', example: 'headquarters' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city', example: 'Douala' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country', example: 'Cameroon' })
  @ApiQuery({ name: 'manager', required: false, description: 'Filter by manager ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiResponse({
    status: 200,
    description: 'List of offices retrieved successfully.',
    type: PaginatedOfficesResponseDto,
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
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('manager') manager?: string,
    @Query('isActive') isActive?: string,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.officesService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office by ID' })
  @ApiParam({ name: 'id', description: 'Office ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Office retrieved successfully.',
    type: OfficeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Office not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.officesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update office by ID' })
  @ApiParam({ name: 'id', description: 'Office ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateOfficeDto })
  @ApiResponse({
    status: 200,
    description: 'Office updated successfully.',
    type: OfficeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Office not found.' })
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.officesService.update(id, updateOfficeDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete office by ID' })
  @ApiParam({ name: 'id', description: 'Office ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Office deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Office not found.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;

    return this.officesService.remove(id, companyId);
  }
}
