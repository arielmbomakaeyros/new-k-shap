import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, ApiProperty, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileUploadDto, FileUploadResponseDto, FileCategory, FileEntityType } from './dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/paginated-response.dto';

class PaginatedFileUploadsResponseDto extends PaginatedResponseDto<FileUploadResponseDto> {
  @ApiProperty({ type: [FileUploadResponseDto] })
  declare data: FileUploadResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare pagination: PaginationMetaDto;
}

@ApiTags('File Upload')
@Controller('file-upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10MB)',
        },
        category: {
          type: 'string',
          enum: Object.values(FileCategory),
          description: 'File category',
          example: 'invoice',
        },
        entityType: {
          type: 'string',
          enum: Object.values(FileEntityType),
          description: 'Entity type this file is associated with',
          example: 'disbursement',
        },
        entityId: {
          type: 'string',
          description: 'Entity ID this file is associated with',
          example: '507f1f77bcf86cd799439011',
        },
        description: {
          type: 'string',
          description: 'File description',
          example: 'Invoice for office supplies',
        },
        tags: {
          type: 'string',
          description: 'Comma-separated tags',
          example: 'Q1,2024,supplies',
        },
      },
      required: ['file', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully.',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file or parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 413, description: 'File too large.' })
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileUploadDto) {
    return this.fileUploadService.uploadFile(file, body);
  }

  @Post()
  @ApiOperation({ summary: 'Create file upload record (for external storage)' })
  @ApiBody({ type: CreateFileUploadDto })
  @ApiResponse({
    status: 201,
    description: 'File upload record created successfully.',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createFileUploadDto: CreateFileUploadDto) {
    return this.fileUploadService.create(createFileUploadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', enum: FileCategory, example: 'invoice' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type', enum: FileEntityType, example: 'disbursement' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by filename or description', example: 'invoice' })
  @ApiQuery({ name: 'mimeType', required: false, description: 'Filter by MIME type', example: 'application/pdf' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by upload date (from)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by upload date (to)', example: '2024-12-31' })
  @ApiResponse({
    status: 200,
    description: 'List of files retrieved successfully.',
    type: PaginatedFileUploadsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('category') category?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('search') search?: string,
    @Query('mimeType') mimeType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.fileUploadService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', description: 'File ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully.',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  findOne(@Param('id') id: string) {
    return this.fileUploadService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for a file' })
  @ApiParam({ name: 'id', description: 'File ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Download URL retrieved successfully.',
    schema: {
      example: {
        downloadUrl: 'https://storage.example.com/files/invoice-001.pdf?token=abc123',
        expiresAt: '2024-01-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  getDownloadUrl(@Param('id') id: string) {
    return this.fileUploadService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiParam({ name: 'id', description: 'File ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  remove(@Param('id') id: string) {
    return this.fileUploadService.remove(id);
  }
}
