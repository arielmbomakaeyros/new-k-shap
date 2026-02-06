import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ReportPeriod } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportResponseDto } from '../../common/dto/report-response.dto';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
    return this.reportsService.getDisbursementsSummary(companyId, period, { department, status });
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
    return this.reportsService.getCollectionsSummary(companyId, period, { department, paymentType });
  }

  @Get('financial-overview')
  @ApiOperation({ summary: 'Get financial overview (net cash flow)' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period',
    enum: ReportPeriod,
    example: 'this_month',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial overview retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getFinancialOverview(
    @Query('period') period?: string,
    @CurrentUser() user?: any,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.getFinancialOverview(companyId, period);
  }

  @Get('department-performance')
  @ApiOperation({ summary: 'Get department performance metrics' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period',
    enum: ReportPeriod,
    example: 'this_month',
  })
  @ApiResponse({
    status: 200,
    description: 'Department performance retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getDepartmentPerformance(
    @Query('period') period?: string,
    @CurrentUser() user?: any,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.getDepartmentPerformance(companyId, period);
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending approvals summary' })
  @ApiResponse({
    status: 200,
    description: 'Pending approvals retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getPendingApprovals(@CurrentUser() user?: any) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.getPendingApprovals(companyId);
  }

  @Get('monthly-trends')
  @ApiOperation({ summary: 'Get monthly trends' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period',
    enum: ReportPeriod,
    example: 'this_year',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly trends retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMonthlyTrends(
    @Query('period') period?: string,
    @CurrentUser() user?: any,
  ) {
    const companyId = user?.isKaeyrosUser
      ? null
      : user?.company
        ? (user.company._id || user.company).toString()
        : null;
    return this.reportsService.getMonthlyTrends(companyId, period);
  }

}
