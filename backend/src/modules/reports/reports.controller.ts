import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { CreateReportDto, ReportType, ReportPeriod } from './dto';
import { ReportResponseDto } from '../../common/dto/report-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class PaginatedReportsResponseDto extends PaginatedResponseDto<ReportResponseDto> {
  @ApiProperty({ type: [ReportResponseDto] })
  declare data: ReportResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Report generated successfully.',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid report configuration.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createReportDto: CreateReportDto, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.create(createReportDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved reports' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (asc/desc)',
    example: 'desc',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by report type',
    enum: ReportType,
    example: 'disbursement_summary',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Filter by period',
    enum: ReportPeriod,
    example: 'this_month',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by creation date (from)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by creation date (to)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reports retrieved successfully.',
    type: PaginatedReportsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('type') type?: string,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.findAll(companyId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary data' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period',
    enum: ReportPeriod,
    example: 'this_month',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully.',
    schema: {
      example: {
        disbursements: {
          total: 5000000,
          count: 150,
          pending: 30,
          completed: 120,
        },
        collections: {
          total: 8000000,
          count: 200,
          fullyPaid: 180,
          partial: 20,
        },
        trends: {
          disbursementChange: 15.5,
          collectionChange: 22.3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getDashboard(@CurrentUser() user: any, @Query('period') period?: string) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.getDashboardSummary(companyId, period);
  }

  @Get('disbursements/summary')
  @ApiOperation({ summary: 'Get disbursements summary report' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period',
    enum: ReportPeriod,
    example: 'this_month',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    example: 'completed',
  })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    description: 'Group data by field',
    example: 'department',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursements summary retrieved successfully.',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getDisbursementsSummary(
    @Query('period') period?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('groupBy') groupBy?: string,
    @CurrentUser() user?: any,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.findAll(companyId);
  }

  @Get('collections/summary')
  @ApiOperation({ summary: 'Get collections summary report' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period',
    enum: ReportPeriod,
    example: 'this_month',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'paymentType',
    required: false,
    description: 'Filter by payment type',
    example: 'cash',
  })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    description: 'Group data by field',
    example: 'paymentType',
  })
  @ApiResponse({
    status: 200,
    description: 'Collections summary retrieved successfully.',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getCollectionsSummary(
    @Query('period') period?: string,
    @Query('department') department?: string,
    @Query('paymentType') paymentType?: string,
    @Query('groupBy') groupBy?: string,
    @CurrentUser() user?: any,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({
    name: 'id',
    description: 'Report ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully.',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.findOne(id, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report by ID' })
  @ApiParam({
    name: 'id',
    description: 'Report ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Report deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.remove(id, companyId);
  }
}
