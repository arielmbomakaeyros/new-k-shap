import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiProperty } from '@nestjs/swagger';
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
  ) {
    return this.usersService.findAll(
      user.company.toString(),
      { page, limit, sortBy, sortOrder },
      {
        search,
        role,
        department,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      },
    );
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
    return this.usersService.findById(id, user.company.toString());
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
    await this.usersService.delete(id, user);
    return { success: true, message: 'User deleted successfully' };
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
    await this.usersService.resendActivation(id, user);
    return { success: true, message: 'Activation email sent' };
  }
}
