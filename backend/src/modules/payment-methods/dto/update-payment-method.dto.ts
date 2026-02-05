import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Payment method code', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Whether the payment method is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
