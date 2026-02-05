import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KaeyrosService } from './kaeyros.service';
import { CreateCompanyByKaeyrosDto, UpdateCompanyStatusDto, ToggleCompanyFeatureDto, UpdateCompanyByKaeyrosDto, CompanyStatus } from './dto';
import { CompanyWithStatsResponseDto, PlatformStatsResponseDto } from '../../common/dto/kaeyros-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class PaginatedCompaniesWithStatsResponseDto extends PaginatedResponseDto<CompanyWithStatsResponseDto> {
  @ApiProperty({ type: [CompanyWithStatsResponseDto] })
  declare data: CompanyWithStatsResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Kaeyros (Platform Admin)')
@Controller('kaeyros')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KaeyrosController {
  constructor(private readonly kaeyrosService: KaeyrosService) {}

  @Post('companies')
  @ApiOperation({ summary: 'Create a new company (Platform Admin only)' })
  @ApiBody({ type: CreateCompanyByKaeyrosDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully with initial admin user.',
    type: CompanyWithStatsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 409, description: 'Company with this email already exists.' })
  create(@Body() createKaeyrosDto: CreateCompanyByKaeyrosDto) {
    return this.kaeyrosService.create(createKaeyrosDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics (Platform Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics retrieved successfully.',
    type: PlatformStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  getPlatformStats() {
    return this.kaeyrosService.getPlatformStats();
  }

  @Get('companies')
  @ApiOperation({ summary: 'Get all companies with statistics (Platform Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for company name or email', example: 'acme' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: CompanyStatus, example: 'active' })
  @ApiQuery({ name: 'plan', required: false, description: 'Filter by subscription plan', example: 'enterprise' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by creation date (from)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by creation date (to)', example: '2024-12-31' })
  @ApiResponse({
    status: 200,
    description: 'List of companies with statistics retrieved successfully.',
    type: PaginatedCompaniesWithStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('isActive') isActive?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.kaeyrosService.getCompanies({ page, limit, sortBy, sortOrder, search, status, plan, isActive, startDate, endDate });
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company details with statistics (Platform Admin only)' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Company details retrieved successfully.',
    type: CompanyWithStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  findOne(@Param('id') id: string) {
    return this.kaeyrosService.findOne(id);
  }

  @Patch('companies/:id/status')
  @ApiOperation({ summary: 'Update company status (activate, suspend, etc.)' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateCompanyStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Company status updated successfully.',
    type: CompanyWithStatsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateCompanyStatusDto) {
    return this.kaeyrosService.update(id, updateStatusDto);
  }

  @Patch('companies/:id')
  @ApiOperation({ summary: 'Update company details (Platform Admin only)' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateCompanyByKaeyrosDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully.',
    type: CompanyWithStatsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  updateCompany(@Param('id') id: string, @Body() updateDto: UpdateCompanyByKaeyrosDto) {
    return this.kaeyrosService.update(id, updateDto);
  }

  @Patch('companies/:id/features')
  @ApiOperation({ summary: 'Toggle company feature on/off' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: ToggleCompanyFeatureDto })
  @ApiResponse({
    status: 200,
    description: 'Company feature toggled successfully.',
    type: CompanyWithStatsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  toggleFeature(@Param('id') id: string, @Body() toggleFeatureDto: ToggleCompanyFeatureDto) {
    return this.kaeyrosService.update(id, toggleFeatureDto);
  }

  @Post('companies/:id/restore-data')
  @ApiOperation({ summary: 'Restore soft-deleted company data' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Company data restored successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  restoreData(@Param('id') id: string) {
    return this.kaeyrosService.findOne(id);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Permanently delete company and all its data' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Company permanently deleted.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Super Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  remove(@Param('id') id: string) {
    return this.kaeyrosService.remove(id);
  }

  @Post('companies/:id/resend-activation')
  @ApiOperation({ summary: 'Resend activation email to the company primary admin' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Activation email sent successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company or admin user not found.' })
  resendActivation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kaeyrosService.resendCompanyAdminActivation(id, user);
  }

  @Post('companies/:id/seed-roles')
  @ApiOperation({ summary: 'Create default roles for a company' })
  @ApiParam({ name: 'id', description: 'Company ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Roles created successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  seedRoles(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kaeyrosService.seedCompanyRoles(id, user?._id?.toString());
  }

  @Post('companies/seed-roles')
  @ApiOperation({ summary: 'Create default roles for all companies' })
  @ApiResponse({
    status: 200,
    description: 'Roles created successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  seedRolesForAll(@CurrentUser() user: any) {
    return this.kaeyrosService.seedRolesForAllCompanies(user?._id?.toString());
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get platform-wide audit logs (Platform Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type', example: 'company_created' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by date (from)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by date (to)', example: '2024-12-31' })
  @ApiResponse({
    status: 200,
    description: 'Platform audit logs retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            action: 'company_created',
            company: { _id: '507f1f77bcf86cd799439012', name: 'Acme Corp' },
            performedBy: { _id: '507f1f77bcf86cd799439013', firstName: 'Admin', lastName: 'User' },
            metadata: { companyName: 'Acme Corp', adminEmail: 'admin@acme.com' },
            createdAt: '2024-01-15T10:00:00.000Z',
          },
        ],
        pagination: { page: 1, limit: 10, total: 100, totalPages: 10 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Platform Admin access required.' })
  getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('company') company?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.kaeyrosService.getAuditLogs({ page, limit, company, action, startDate, endDate });
  }
}
