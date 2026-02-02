import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum FileCategory {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  CONTRACT = 'contract',
  ATTACHMENT = 'attachment',
  PROFILE_PICTURE = 'profile_picture',
  COMPANY_LOGO = 'company_logo',
  REPORT = 'report',
  OTHER = 'other',
}

export enum FileEntityType {
  DISBURSEMENT = 'disbursement',
  COLLECTION = 'collection',
  USER = 'user',
  COMPANY = 'company',
  BENEFICIARY = 'beneficiary',
}

export class CreateFileUploadDto {
  @ApiProperty({
    description: 'File category',
    enum: FileCategory,
    example: FileCategory.INVOICE,
  })
  @IsEnum(FileCategory)
  @IsNotEmpty()
  category: FileCategory;

  @ApiProperty({
    description: 'Entity type this file is associated with',
    enum: FileEntityType,
    example: FileEntityType.DISBURSEMENT,
    required: false,
  })
  @IsEnum(FileEntityType)
  @IsOptional()
  entityType?: FileEntityType;

  @ApiProperty({
    description: 'Entity ID this file is associated with',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({
    description: 'Custom description for the file',
    example: 'Invoice for office supplies purchase',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tags for the file',
    example: 'Q1,2024,supplies',
    required: false,
  })
  @IsString()
  @IsOptional()
  tags?: string;
}

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'File ID',
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
    description: 'Original file name',
    example: 'invoice-001.pdf',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'Stored file name',
    example: '1705320000000-invoice-001.pdf',
  })
  @IsString()
  storedName: string;

  @ApiProperty({
    description: 'File MIME type',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 102400,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    description: 'File URL',
    example: 'https://storage.example.com/files/1705320000000-invoice-001.pdf',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'File category',
    example: 'invoice',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Entity type this file is associated with',
    example: 'disbursement',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiProperty({
    description: 'Entity ID this file is associated with',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({
    description: 'File description',
    example: 'Invoice for office supplies purchase',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'User who uploaded the file',
    example: { _id: '507f1f77bcf86cd799439013', firstName: 'John', lastName: 'Doe' },
  })
  uploadedBy: any;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  createdAt: Date;
}
