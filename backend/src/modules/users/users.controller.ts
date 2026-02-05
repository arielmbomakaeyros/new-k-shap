import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiProperty, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { UserProfileDto } from '../auth/dto/user-profile.dto';
import { UserResponseDto } from '../../common/dto/user-response.dto';

// Define a specific response DTO for paginated users
class PaginatedUsersResponseDto extends PaginatedResponseDto<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto] })
  declare data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @RequirePermissions('user.create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user);
  }

  @Get()
  @RequirePermissions('user.read')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company (Kaeyros admins only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
    type: PaginatedUsersResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('department') department?: string,
    @Query('isActive') isActive?: string,
    @Query('companyId') companyId?: string,
  ) {
    // Kaeyros admins (no company) can see all users; company users only see their company's users
    const ownCompanyId = user.company ? (user.company._id || user.company).toString() : null;
    if (!user?.isKaeyrosUser && !ownCompanyId) {
      throw new ForbiddenException('Company context is required for this operation');
    }

    return this.usersService.findAll(
      user?.isKaeyrosUser ? (companyId || null) : ownCompanyId,
      { page, limit, sortBy, sortOrder },
      {
        search,
        role,
        department,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      },
    );
  }

  @Get('template')
  @RequirePermissions('user.create')
  @ApiOperation({ summary: 'Download user import template (CSV)' })
  @ApiResponse({ status: 200, description: 'Template generated successfully.' })
  async downloadTemplate(
    @CurrentUser() user: any,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    if (!user?.isKaeyrosUser && !user?.company) {
      throw new ForbiddenException('Company context is required for this operation');
    }

    const normalizedFormat = (format || 'csv').toLowerCase();
    const datePart = new Date().toISOString().slice(0, 10);

    if (normalizedFormat === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Users');
      sheet.columns = [
        { header: 'email', key: 'email', width: 28 },
        { header: 'firstName', key: 'firstName', width: 16 },
        { header: 'lastName', key: 'lastName', width: 16 },
        { header: 'phone', key: 'phone', width: 16 },
        { header: 'systemRoles', key: 'systemRoles', width: 24 },
        { header: 'roles', key: 'roles', width: 24 },
        { header: 'departments', key: 'departments', width: 24 },
        { header: 'offices', key: 'offices', width: 24 },
      ];
      sheet.addRow({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+237600000000',
        systemRoles: 'company_super_admin',
        roles: '',
        departments: '',
        offices: '',
      });
      sheet.getRow(1).font = { bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="users-template-${datePart}.xlsx"`,
      );
      return res.send(Buffer.from(buffer as any));
    }

    const headers = [
      'email',
      'firstName',
      'lastName',
      'phone',
      'systemRoles',
      'roles',
      'departments',
      'offices',
    ];
    const sample = [
      'john.doe@example.com',
      'John',
      'Doe',
      '+237600000000',
      'company_super_admin',
      '',
      '',
      '',
    ];

    const escape = (value: string) => {
      if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csv = [
      headers.map(escape).join(','),
      sample.map(escape).join(','),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="users-template-${datePart}.csv"`,
    );
    return res.send(csv);
  }

  @Post('bulk-import')
  @RequirePermissions('user.create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk import users from CSV/XLSX' })
  async bulkImport(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.usersService.bulkImport(file, user);
  }

  @Get(':id')
  @RequirePermissions('user.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
    type: UserResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const companyId = user.company ? (user.company._id || user.company).toString() : null;
    if (!user?.isKaeyrosUser && !companyId) {
      throw new ForbiddenException('Company context is required for this operation');
    }
    return this.usersService.findById(id, companyId);
  }

  @Put(':id')
  @RequirePermissions('user.update')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    if (!user?.isKaeyrosUser && !user?.company) {
      throw new ForbiddenException('Company context is required for this operation');
    }
    return this.usersService.update(id, dto, user);
  }

  @Patch(':id')
  @RequirePermissions('user.update')
  @ApiOperation({ summary: 'Patch user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async patch(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    if (!user?.isKaeyrosUser && !user?.company) {
      throw new ForbiddenException('Company context is required for this operation');
    }
    return this.usersService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.isKaeyrosUser && !user?.company) {
      throw new ForbiddenException('Company context is required for this operation');
    }
    await this.usersService.delete(id, user);
    return { success: true, message: 'User deleted successfully' };
  }


  @Post(':id/avatar')
  @RequirePermissions('user.update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User avatar updated successfully.' })
  async uploadAvatar(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.usersService.updateAvatar(id, file, req.user);
  }

  @Post(':id/restore')
  @RequirePermissions('user.restore')
  @ApiOperation({ summary: 'Restore soft-deleted user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully.',
    type: UserResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async restore(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.isKaeyrosUser && !user?.company) {
      throw new ForbiddenException('Company context is required for this operation');
    }
    return this.usersService.restore(id, user);
  }

  @Post(':id/resend-activation')
  @RequirePermissions('user.update')
  @ApiOperation({ summary: 'Resend activation email to user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Activation email sent successfully.',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async resendActivation(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.isKaeyrosUser && !user?.company) {
      throw new ForbiddenException('Company context is required for this operation');
    }
    await this.usersService.resendActivation(id, user);
    return { success: true, message: 'Activation email sent' };
  }
}
