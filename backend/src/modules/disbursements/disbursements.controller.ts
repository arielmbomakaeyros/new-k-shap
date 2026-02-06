import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { DisbursementsService } from './disbursements.service';
import {
  CreateDisbursementDto,
  UpdateDisbursementDto,
  DisbursementStatus,
  PaymentType,
  DisbursementPriority,
} from './dto';
import { UserRole } from '../../database/schemas/enums';
import { DisbursementResponseDto } from '../../common/dto/disbursement-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from '../../common/dto/paginated-response.dto';

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
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  create(
    @Body() createDisbursementDto: CreateDisbursementDto,
    @Req() req: any,
  ) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.disbursementsService.create(
      createDisbursementDto,
      userId,
      companyId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all disbursements with filtering, sorting, and pagination',
  })
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
    name: 'search',
    required: false,
    description: 'Search term for reference number or description',
    example: 'DIS-2024',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: DisbursementStatus,
    example: 'pending_validator',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'office',
    required: false,
    description: 'Filter by office ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'beneficiary',
    required: false,
    description: 'Filter by beneficiary ID',
    example: '507f1f77bcf86cd799439013',
  })
  @ApiQuery({
    name: 'disbursementType',
    required: false,
    description: 'Filter by disbursement type ID',
    example: '507f1f77bcf86cd799439014',
  })
  @ApiQuery({
    name: 'paymentMethod',
    required: false,
    description: 'Filter by payment method',
    enum: PaymentType,
    example: 'bank_transfer',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    description: 'Filter by priority',
    enum: DisbursementPriority,
    example: 'high',
  })
  @ApiQuery({
    name: 'isUrgent',
    required: false,
    description: 'Filter by urgent flag',
    example: true,
  })
  @ApiQuery({
    name: 'isRetroactive',
    required: false,
    description: 'Filter by retroactive flag',
    example: false,
  })
  @ApiQuery({
    name: 'isCompleted',
    required: false,
    description: 'Filter by completion status',
    example: false,
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    description: 'Minimum amount filter',
    example: 10000,
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    description: 'Maximum amount filter',
    example: 1000000,
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
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Filter by tags (comma-separated)',
    example: 'supplies,procurement',
  })
  @ApiResponse({
    status: 200,
    description: 'List of disbursements retrieved successfully.',
    type: PaginatedDisbursementsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Req() req: any,
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
    const user = req.user;
    const companyId = user?.isKaeyrosUser
      ? undefined
      : user?.company
        ? (user.company._id || user.company).toString()
        : undefined;

    const roleFilters: { createdBy?: string; department?: string } = {};
    const systemRoles = user?.systemRoles || [];
    const hasElevatedRole =
      user?.isKaeyrosUser ||
      systemRoles.includes(UserRole.COMPANY_SUPER_ADMIN) ||
      systemRoles.includes(UserRole.VALIDATOR) ||
      systemRoles.includes(UserRole.CASHIER);
    if (!hasElevatedRole) {
      if (systemRoles.includes(UserRole.DEPARTMENT_HEAD)) {
        const deptIds = (user?.departments || [])
          .map((d: any) => d?._id || d)
          .filter(Boolean);
        roleFilters.department = deptIds.length
          ? deptIds.join(',')
          : '000000000000000000000000';
      } else if (systemRoles.includes(UserRole.AGENT)) {
        roleFilters.createdBy = user?._id?.toString();
      } else {
        roleFilters.createdBy = user?._id?.toString();
      }
    }

    return this.disbursementsService.findAll(companyId, {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      status,
      department: roleFilters.department || department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
      createdBy: roleFilters.createdBy,
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export disbursements as CSV/XLSX' })
  @ApiQuery({ name: 'format', required: false, description: 'Export format', example: 'csv' })
  async exportDisbursements(
    @Req() req: any,
    @Res() res: Response,
    @Query('format') format?: string,
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
    const user = req.user;
    const companyId = user?.isKaeyrosUser
      ? undefined
      : user?.company
        ? (user.company._id || user.company).toString()
        : undefined;

    const roleFilters: { createdBy?: string; department?: string } = {};
    const systemRoles = user?.systemRoles || [];
    const hasElevatedRole =
      user?.isKaeyrosUser ||
      systemRoles.includes(UserRole.COMPANY_SUPER_ADMIN) ||
      systemRoles.includes(UserRole.VALIDATOR) ||
      systemRoles.includes(UserRole.CASHIER);
    if (!hasElevatedRole) {
      if (systemRoles.includes(UserRole.DEPARTMENT_HEAD)) {
        const deptIds = (user?.departments || [])
          .map((d: any) => d?._id || d)
          .filter(Boolean);
        roleFilters.department = deptIds.length
          ? deptIds.join(',')
          : '000000000000000000000000';
      } else if (systemRoles.includes(UserRole.AGENT)) {
        roleFilters.createdBy = user?._id?.toString();
      } else {
        roleFilters.createdBy = user?._id?.toString();
      }
    }

    const normalizedFormat = (format || 'csv').toLowerCase();
    const exportOptions = {
      sortBy,
      sortOrder,
      search,
      status,
      department: roleFilters.department || department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
      createdBy: roleFilters.createdBy,
    };

    const datePart = new Date().toISOString().slice(0, 10);

    if (normalizedFormat === 'xlsx') {
      const buffer = await this.disbursementsService.exportXlsx(companyId, exportOptions);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="disbursements-${datePart}.xlsx"`,
      );
      return res.send(Buffer.from(buffer as any));
    }

    const csv = await this.disbursementsService.exportCsv(companyId, exportOptions);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="disbursements-${datePart}.csv"`,
    );
    return res.send(csv);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update disbursement by ID' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateDisbursementDto })
  @ApiResponse({
    status: 200,
    description: 'Disbursement updated successfully.',
    type: DisbursementResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot modify disbursement in current status.',
  })
  @ApiResponse({ status: 404, description: 'Disbursement not found.' })
  update(
    @Param('id') id: string,
    @Body() updateDisbursementDto: UpdateDisbursementDto,
    @Req() req: any,
  ) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.update(
      id,
      updateDisbursementDto,
      userId,
      companyId,
      req.user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete disbursement by ID (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete disbursement in current status.',
  })
  @ApiResponse({ status: 404, description: 'Disbursement not found.' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.remove(id, userId, companyId, req.user);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit disbursement for approval' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement submitted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot submit in current status.',
  })
  submit(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.submit(id, userId, companyId, req.user);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve disbursement' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: { type: 'object', properties: { notes: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement approved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot approve in current status.',
  })
  approve(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.approve(id, userId, notes, companyId, req.user);
  }

  @Post(':id/force-complete')
  @ApiOperation({ summary: 'Force complete disbursement (validator/admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: { type: 'object', properties: { reason: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement force completed successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions.',
  })
  forceComplete(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.forceComplete(id, userId, reason, companyId, req.user);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject disbursement' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { reason: { type: 'string' } },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement rejected successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot reject in current status.',
  })
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.reject(id, userId, reason, companyId, req.user);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel disbursement' })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { reason: { type: 'string' } },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement cancelled successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot cancel in current status.',
  })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const userId = req.user?._id?.toString();
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.cancel(id, userId, reason, companyId, req.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get disbursement by ID with all populated references',
  })
  @ApiParam({
    name: 'id',
    description: 'Disbursement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description:
      'Disbursement retrieved successfully with populated beneficiary, department, office, and disbursement type.',
    type: DisbursementResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Disbursement not found.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.isKaeyrosUser
      ? undefined
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.disbursementsService.findOne(id, companyId, req.user);
  }
}
