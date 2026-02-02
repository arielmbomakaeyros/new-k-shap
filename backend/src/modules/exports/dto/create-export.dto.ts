import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExportType {
  DISBURSEMENTS = 'disbursements',
  COLLECTIONS = 'collections',
  USERS = 'users',
  BENEFICIARIES = 'beneficiaries',
  AUDIT_LOGS = 'audit_logs',
  DEPARTMENTS = 'departments',
  OFFICES = 'offices',
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json',
}

export class CreateExportDto {
  @ApiProperty({
    description: 'Type of data to export',
    enum: ExportType,
    example: ExportType.DISBURSEMENTS,
  })
  @IsEnum(ExportType)
  @IsNotEmpty()
  type: ExportType;

  @ApiProperty({
    description: 'Export file format',
    enum: ExportFormat,
    example: ExportFormat.EXCEL,
  })
  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @ApiProperty({
    description: 'Export name/title',
    example: 'Disbursements Report Q1 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Fields to include in export',
    example: ['referenceNumber', 'amount', 'status', 'createdAt'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fields?: string[];

  @ApiProperty({
    description: 'Filter criteria',
    example: { status: 'completed', department: '507f1f77bcf86cd799439011' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Start date for data range',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date for data range',
    example: '2024-03-31T23:59:59.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
