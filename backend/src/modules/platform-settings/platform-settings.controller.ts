import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlatformSettingsService } from './platform-settings.service';

@ApiTags('Platform Settings')
@Controller('kaeyros/settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform settings (Kaeyros admin only)' })
  @ApiResponse({ status: 200, description: 'Platform settings retrieved successfully.' })
  async getSettings(@Req() req: any) {
    if (!req.user?.isKaeyrosUser) {
      return { success: false, message: 'Forbidden' };
    }
    return this.platformSettingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update platform settings (Kaeyros admin only)' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Platform settings updated successfully.' })
  async updateSettings(@Body() update: any, @Req() req: any) {
    if (!req.user?.isKaeyrosUser) {
      return { success: false, message: 'Forbidden' };
    }
    return this.platformSettingsService.updateSettings(update);
  }
}
