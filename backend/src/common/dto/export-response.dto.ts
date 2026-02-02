import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDate, IsNumber, IsObject, IsArray } from 'class-validator';

export class ExportResponseDto {
  @ApiProperty({
    description: 'Export ID',
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
    description: 'Type of data exported',
    example: 'disbursements',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Export file format',
    example: 'excel',
  })
  @IsString()
  format: string;

  @ApiProperty({
    description: 'Export name/title',
    example: 'Disbursements Report Q1 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Export status',
    example: 'completed',
  })
  @IsString()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({
    description: 'URL to download the exported file',
    example: 'https://storage.example.com/exports/export-123.xlsx',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 102400,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'Number of records exported',
    example: 500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  recordCount?: number;

  @ApiProperty({
    description: 'User who requested the export',
    example: { _id: '507f1f77bcf86cd799439013', firstName: 'John', lastName: 'Doe' },
    required: false,
  })
  @IsOptional()
  requestedBy?: any;

  @ApiProperty({
    description: 'Filters applied to the export',
    example: { status: 'completed', department: '507f1f77bcf86cd799439011' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Fields included in export',
    example: ['referenceNumber', 'amount', 'status', 'createdAt'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  fields?: string[];

  @ApiProperty({
    description: 'Date range start',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Date range end',
    example: '2024-03-31T23:59:59.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Error message if export failed',
    example: 'Failed to generate report',
    required: false,
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Completion timestamp',
    example: '2024-01-15T09:05:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  completedAt?: Date;
}
