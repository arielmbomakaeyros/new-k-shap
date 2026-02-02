import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsNumber, IsObject, IsArray, IsBoolean } from 'class-validator';

export class ReportDataDto {
  @ApiProperty({
    description: 'Summary metrics',
    example: {
      totalAmount: 5000000,
      totalCount: 150,
      averageAmount: 33333.33,
      completedCount: 120,
      pendingCount: 30,
    },
  })
  @IsObject()
  summary: Record<string, any>;

  @ApiProperty({
    description: 'Detailed data rows',
    example: [
      { department: 'Finance', amount: 2000000, count: 50 },
      { department: 'HR', amount: 1500000, count: 40 },
    ],
    type: [Object],
    required: false,
  })
  @IsArray()
  @IsOptional()
  details?: any[];

  @ApiProperty({
    description: 'Chart data for visualization',
    example: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Disbursements', data: [1000000, 1500000, 2000000] }],
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  chartData?: Record<string, any>;

  @ApiProperty({
    description: 'Trend data',
    example: {
      trend: 'up',
      percentageChange: 15.5,
      comparison: 'vs last period',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  trends?: Record<string, any>;
}

export class ReportResponseDto {
  @ApiProperty({
    description: 'Report ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Report type',
    example: 'disbursement_summary',
  })
  @IsString()
  type: string;

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
    description: 'Time period',
    example: 'this_quarter',
    required: false,
  })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiProperty({
    description: 'Start date of report range',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date of report range',
    example: '2024-03-31T23:59:59.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Filters applied',
    example: { department: '507f1f77bcf86cd799439011', status: 'completed' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Report data',
    type: ReportDataDto,
  })
  data: ReportDataDto;

  @ApiProperty({
    description: 'User who generated the report',
    example: { _id: '507f1f77bcf86cd799439013', firstName: 'John', lastName: 'Doe' },
    required: false,
  })
  @IsOptional()
  generatedBy?: any;

  @ApiProperty({
    description: 'Whether this report is cached',
    example: false,
  })
  @IsBoolean()
  isCached: boolean;

  @ApiProperty({
    description: 'Cache expiry time',
    example: '2024-01-15T10:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  cacheExpiresAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;
}
