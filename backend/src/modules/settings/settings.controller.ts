import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import type {
  UpdateCompanyInfoDto,
  UpdateWorkflowSettingsDto,
  UpdateEmailNotificationSettingsDto,
  UpdateCompanyPreferencesDto,
} from './settings.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  @ApiOperation({ summary: 'Get company settings' })
  @ApiResponse({
    status: 200,
    description: 'Company settings retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getCompanySettings(@Req() req: any) {
    const companyId = req.user?.company;
    return this.settingsService.getCompanySettings(companyId);
  }

  @Patch('company/info')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update company information' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        industry: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Company information updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateCompanyInfo(
    @Req() req: any,
    @Body() updateDto: UpdateCompanyInfoDto,
  ) {
    const companyId = req.user?.company;
    return this.settingsService.updateCompanyInfo(companyId, updateDto);
  }

  @Patch('company/workflow')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update workflow settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        requireDeptHeadApproval: { type: 'boolean' },
        requireValidatorApproval: { type: 'boolean' },
        requireCashierExecution: { type: 'boolean' },
        maxAmountNoApproval: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow settings updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateWorkflowSettings(
    @Req() req: any,
    @Body() updateDto: UpdateWorkflowSettingsDto,
  ) {
    const companyId = req.user?.company;
    return this.settingsService.updateWorkflowSettings(companyId, updateDto);
  }

  @Patch('company/notifications')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update email notification settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        onNewDisbursement: { type: 'boolean' },
        onDisbursementApproved: { type: 'boolean' },
        onDisbursementRejected: { type: 'boolean' },
        onCollectionAdded: { type: 'boolean' },
        dailySummary: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email notification settings updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateEmailNotificationSettings(
    @Req() req: any,
    @Body() updateDto: UpdateEmailNotificationSettingsDto,
  ) {
    const companyId = req.user?.company;
    return this.settingsService.updateEmailNotificationSettings(
      companyId,
      updateDto,
    );
  }

  @Patch('company/preferences')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update company preferences (currency, payment methods, branding, channels)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        defaultCurrency: { type: 'string' },
        paymentMethods: { type: 'array', items: { type: 'string' } },
        logoUrl: { type: 'string' },
        primaryColor: { type: 'string' },
        supportedLanguages: { type: 'array', items: { type: 'string' } },
        defaultLanguage: { type: 'string' },
        notificationChannels: {
          type: 'object',
          properties: {
            email: { type: 'boolean' },
            sms: { type: 'boolean' },
            whatsapp: { type: 'boolean' },
            inApp: { type: 'boolean' },
          },
        },
        payoutSchedule: {
          type: 'object',
          properties: {
            frequency: { type: 'string' },
            dayOfMonth: { type: 'number' },
            dayOfWeek: { type: 'string' },
          },
        },
        approvalLimitsByRole: { type: 'object' },
        officeSpendCaps: { type: 'object' },
        defaultBeneficiaries: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Company preferences updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateCompanyPreferences(
    @Req() req: any,
    @Body() updateDto: UpdateCompanyPreferencesDto,
  ) {
    const companyId = req.user?.company;
    return this.settingsService.updateCompanyPreferences(companyId, updateDto);
  }

  @Get('workflow-templates')
  @ApiOperation({ summary: 'Get available workflow templates' })
  @ApiResponse({ status: 200, description: 'Workflow templates retrieved successfully.' })
  async getWorkflowTemplates(@Req() req: any) {
    const companyId = req.user?.company ? (req.user.company._id || req.user.company).toString() : null;
    return this.settingsService.getWorkflowTemplates(companyId);
  }

  @Patch('workflow-templates/:id/activate')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Set active workflow template for company' })
  @ApiResponse({ status: 200, description: 'Workflow template activated.' })
  async setActiveWorkflowTemplate(
    @Req() req: any,
    @Param('id') templateId: string,
  ) {
    const companyId = req.user?.company ? (req.user.company._id || req.user.company).toString() : null;
    return this.settingsService.setActiveWorkflowTemplate(companyId, templateId);
  }

  @Post('workflow-templates')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Create a custom workflow template' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              order: { type: 'number' },
              name: { type: 'string' },
              roleRequired: { type: 'string' },
              isOptional: { type: 'boolean' },
              description: { type: 'string' },
              statusOnPending: { type: 'string' },
              statusOnComplete: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Workflow template created.' })
  async createWorkflowTemplate(
    @Req() req: any,
    @Body() dto: { name: string; description?: string; steps: any[] },
  ) {
    const companyId = req.user?.company ? (req.user.company._id || req.user.company).toString() : null;
    const userId = req.user?.sub || req.user?._id;
    return this.settingsService.createCustomWorkflowTemplate(companyId, userId, dto);
  }

  @Delete('workflow-templates/:id')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Delete a custom workflow template' })
  @ApiResponse({ status: 200, description: 'Workflow template deleted.' })
  async deleteWorkflowTemplate(
    @Req() req: any,
    @Param('id') templateId: string,
  ) {
    const companyId = req.user?.company ? (req.user.company._id || req.user.company).toString() : null;
    return this.settingsService.deleteWorkflowTemplate(companyId, templateId);
  }
}
