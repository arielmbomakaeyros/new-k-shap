import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method name', example: 'Mobile Money' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique payment method code', example: 'mobile_money' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Whether the payment method is active', required: false, example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
