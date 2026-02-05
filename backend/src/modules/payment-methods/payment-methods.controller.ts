import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';

@ApiTags('Payment Methods')
@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Create a payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully.' })
  create(@Body() dto: CreatePaymentMethodDto, @CurrentUser() user: any) {
    const companyId = user?.company?._id || user?.company;
    return this.paymentMethodsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get payment methods' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company ID (Kaeyros admins only)' })
  findAll(@CurrentUser() user: any, @Query('companyId') companyId?: string) {
    const resolvedCompanyId = user?.isKaeyrosUser ? companyId || null : (user?.company?._id || user?.company);
    return this.paymentMethodsService.findAll(resolvedCompanyId);
  }

  @Patch(':id')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update payment method' })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto, @CurrentUser() user: any) {
    const companyId = user?.company?._id || user?.company;
    return this.paymentMethodsService.update(id, companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Delete payment method' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const companyId = user?.company?._id || user?.company;
    return this.paymentMethodsService.remove(id, companyId);
  }

  @Post('seed-default')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Seed default payment methods for current company' })
  seedDefaults(@CurrentUser() user: any) {
    const companyId = user?.company?._id || user?.company;
    return this.paymentMethodsService.createDefaultCompanyPaymentMethods(companyId);
  }
}
