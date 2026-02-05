import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DisbursementTemplatesService } from './disbursement-templates.service';
import { CreateDisbursementTemplateDto, UpdateDisbursementTemplateDto } from './dto';

@ApiTags('Disbursement Templates')
@Controller('disbursement-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisbursementTemplatesController {
  constructor(private readonly templatesService: DisbursementTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a disbursement template' })
  @ApiBody({ type: CreateDisbursementTemplateDto })
  @ApiResponse({ status: 201, description: 'Template created successfully.' })
  create(@Body() dto: CreateDisbursementTemplateDto, @Req() req: any) {
    const companyId = req.user?.isKaeyrosUser
      ? null
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    const userId = req.user._id?.toString() || req.user.id;
    return this.templatesService.create(dto, companyId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates for company' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully.' })
  findAll(@Req() req: any) {
    const companyId = req.user?.isKaeyrosUser
      ? null
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.templatesService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.isKaeyrosUser
      ? null
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    return this.templatesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateDisbursementTemplateDto, @Req() req: any) {
    const companyId = req.user?.isKaeyrosUser
      ? null
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    const userId = req.user._id?.toString() || req.user.id;
    return this.templatesService.update(id, dto, companyId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.isKaeyrosUser
      ? null
      : req.user?.company
        ? (req.user.company._id || req.user.company).toString()
        : undefined;
    const userId = req.user._id?.toString() || req.user.id;
    return this.templatesService.remove(id, companyId, userId);
  }
}
