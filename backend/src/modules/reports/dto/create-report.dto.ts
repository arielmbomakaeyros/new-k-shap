import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportType {
  DISBURSEMENT_SUMMARY = 'disbursement_summary',
  COLLECTION_SUMMARY = 'collection_summary',
  FINANCIAL_OVERVIEW = 'financial_overview',
  DEPARTMENT_PERFORMANCE = 'department_performance',
  USER_ACTIVITY = 'user_activity',
  PENDING_APPROVALS = 'pending_approvals',
  MONTHLY_TRENDS = 'monthly_trends',
  CUSTOM = 'custom',
}

export enum ReportPeriod {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_QUARTER = 'this_quarter',
  THIS_YEAR = 'this_year',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  CUSTOM = 'custom',
}

export class CreateReportDto {
  @ApiProperty({
    description: 'Type of report to generate',
    enum: ReportType,
    example: ReportType.DISBURSEMENT_SUMMARY,
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @ApiProperty({
    description: 'Report name/title',
    example: 'Q1 2024 Disbursement Summary',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Report description',
    example: 'Summary of all disbursements for Q1 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Time period for the report',
    enum: ReportPeriod,
    example: ReportPeriod.THIS_MONTH,
    required: false,
  })
  @IsEnum(ReportPeriod)
  @IsOptional()
  period?: ReportPeriod;

  @ApiProperty({
    description: 'Custom start date (required if period is CUSTOM)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Custom end date (required if period is CUSTOM)',
    example: '2024-03-31T23:59:59.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Filter criteria',
    example: { department: '507f1f77bcf86cd799439011', status: 'completed' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Group data by field',
    example: 'department',
    required: false,
  })
  @IsString()
  @IsOptional()
  groupBy?: string;

  @ApiProperty({
    description: 'Metrics to include in the report',
    example: ['totalAmount', 'count', 'averageAmount'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metrics?: string[];

  @ApiProperty({
    description: 'Whether to include chart data',
    example: true,
    required: false,
  })
  @IsOptional()
  includeCharts?: boolean;
}
