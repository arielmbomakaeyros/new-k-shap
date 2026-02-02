import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class DisbursementTypeResponseDto {
  @ApiProperty({
    description: 'Disbursement type ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Name of the disbursement type',
    example: 'Salary Payment',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the disbursement type',
    example: 'Regular salary payment to employees',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the disbursement type is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Disbursement type creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Disbursement type last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}