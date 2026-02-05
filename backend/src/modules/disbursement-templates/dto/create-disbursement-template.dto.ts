import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, Min } from 'class-validator';
import { PaymentType, DisbursementPriority } from '../../disbursements/dto/create-disbursement.dto';

export class CreateDisbursementTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Monthly Office Supplies' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Template description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Amount', example: 150000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'XAF', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Disbursement type ID' })
  @IsString()
  @IsNotEmpty()
  disbursementType: string;

  @ApiProperty({ description: 'Beneficiary ID' })
  @IsString()
  @IsNotEmpty()
  beneficiary: string;

  @ApiProperty({ description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Office ID', required: false })
  @IsString()
  @IsOptional()
  office?: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentType, required: false })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentMethod?: PaymentType;

  @ApiProperty({ description: 'Purpose', required: false })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({ description: 'Priority', enum: DisbursementPriority, required: false })
  @IsEnum(DisbursementPriority)
  @IsOptional()
  priority?: DisbursementPriority;

  @ApiProperty({ description: 'Is urgent', required: false })
  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
