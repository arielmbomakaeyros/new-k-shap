import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto, UpdateEmailSettingsDto, UpdateReminderSettingsDto } from './dto';
import { SettingResponseDto, EmailSettingsResponseDto, ReminderSettingsResponseDto } from '../../common/dto/setting-response.dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

class PaginatedSettingsResponseDto extends PaginatedResponseDto<SettingResponseDto> {
  @ApiProperty({ type: [SettingResponseDto] })
  declare data: SettingResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiBody({ type: CreateSettingDto })
  @ApiResponse({
    status: 201,
    description: 'Setting created successfully.',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Setting with this key already exists.' })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', example: 'notifications' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for key or description', example: 'email' })
  @ApiQuery({ name: 'isSystemSetting', required: false, description: 'Filter by system setting status', example: false })
  @ApiResponse({
    status: 200,
    description: 'List of settings retrieved successfully.',
    type: PaginatedSettingsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isSystemSetting') isSystemSetting?: string,
  ) {
    return this.settingsService.findAll();
  }

  @Get('email')
  @ApiOperation({ summary: 'Get email settings for the company' })
  @ApiResponse({
    status: 200,
    description: 'Email settings retrieved successfully.',
    type: EmailSettingsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getEmailSettings() {
    return this.settingsService.findAll();
  }

  @Patch('email')
  @ApiOperation({ summary: 'Update email settings for the company' })
  @ApiBody({ type: UpdateEmailSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Email settings updated successfully.',
    type: EmailSettingsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateEmailSettings(@Body() updateEmailSettingsDto: UpdateEmailSettingsDto) {
    return this.settingsService.update('email', updateEmailSettingsDto);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Get reminder settings for the company' })
  @ApiResponse({
    status: 200,
    description: 'Reminder settings retrieved successfully.',
    type: ReminderSettingsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getReminderSettings() {
    return this.settingsService.findAll();
  }

  @Patch('reminders')
  @ApiOperation({ summary: 'Update reminder settings for the company' })
  @ApiBody({ type: UpdateReminderSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Reminder settings updated successfully.',
    type: ReminderSettingsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateReminderSettings(@Body() updateReminderSettingsDto: UpdateReminderSettingsDto) {
    return this.settingsService.update('reminders', updateReminderSettingsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Setting retrieved successfully.',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({
    status: 200,
    description: 'Setting updated successfully.',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Setting deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
