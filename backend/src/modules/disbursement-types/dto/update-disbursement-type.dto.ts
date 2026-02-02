import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDisbursementTypeDto {
  @ApiProperty({
    description: 'Name of the disbursement type',
    example: 'Updated Salary Payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the disbursement type',
    example: 'Updated regular salary payment to employees',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the disbursement type is active',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}