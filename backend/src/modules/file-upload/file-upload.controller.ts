import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiProperty,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateFileUploadDto,
  FileUploadResponseDto,
  FileCategory,
  FileEntityType,
} from './dto';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from '../../common/dto/paginated-response.dto';

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
  @ApiOperation({ summary: 'Upload a single file' })
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
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file or parameters.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 413, description: 'File too large.' })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateFileUploadDto,
    @Req() req: any,
  ) {
    const context = {
      userId: req.user._id?.toString() || req.user.id,
      companyId: req.user.company ? (req.user.company._id || req.user.company).toString() : undefined,
    };
    return this.fileUploadService.uploadFile(file, body, context);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Files to upload (max 10 files, 10MB each)',
        },
        category: {
          type: 'string',
          enum: Object.values(FileCategory),
          description: 'File category',
        },
        entityType: {
          type: 'string',
          enum: Object.values(FileEntityType),
          description: 'Entity type',
        },
        entityId: {
          type: 'string',
          description: 'Entity ID',
        },
        description: {
          type: 'string',
          description: 'File description',
        },
      },
      required: ['files', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully.',
    type: [FileUploadResponseDto],
  })
  uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateFileUploadDto,
    @Req() req: any,
  ) {
    const context = {
      userId: req.user._id?.toString() || req.user.id,
      companyId: req.user.company ? (req.user.company._id || req.user.company).toString() : undefined,
    };
    return this.fileUploadService.uploadMultipleFiles(files, body, context);
  }

  @Post()
  @ApiOperation({ summary: 'Create file upload record (for external storage)' })
  @ApiBody({ type: CreateFileUploadDto })
  @ApiResponse({
    status: 201,
    description: 'File upload record created successfully.',
    type: FileUploadResponseDto,
  })
  create(@Body() createFileUploadDto: CreateFileUploadDto, @Req() req: any) {
    const context = {
      userId: req.user._id?.toString() || req.user.id,
      companyId: req.user.company ? (req.user.company._id || req.user.company).toString() : undefined,
    };
    return this.fileUploadService.create(createFileUploadDto, context);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort field',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    example: 'desc',
  })
  @ApiQuery({ name: 'category', required: false, enum: FileCategory })
  @ApiQuery({ name: 'entityType', required: false, enum: FileEntityType })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'mimeType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully.',
    type: PaginatedFileUploadsResponseDto,
  })
  findAll(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('category') category?: FileCategory,
    @Query('entityType') entityType?: FileEntityType,
    @Query('entityId') entityId?: string,
    @Query('search') search?: string,
    @Query('mimeType') mimeType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const companyId = req.user.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.fileUploadService.findAll(companyId, {
      page,
      limit,
      sortBy,
      sortOrder,
      category,
      entityType,
      entityId,
      search,
      mimeType,
      startDate,
      endDate,
    });
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get files by entity' })
  @ApiParam({ name: 'entityType', enum: FileEntityType })
  @ApiParam({ name: 'entityId' })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully.',
    type: [FileUploadResponseDto],
  })
  findByEntity(
    @Req() req: any,
    @Param('entityType') entityType: FileEntityType,
    @Param('entityId') entityId: string,
  ) {
    const companyId = req.user.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.fileUploadService.findByEntity(companyId, entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully.',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.fileUploadService.findOne(id, companyId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for a file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'Download URL retrieved successfully.',
    schema: {
      example: {
        downloadUrl:
          'https://storage.example.com/files/invoice-001.pdf?token=abc123',
        expiresAt: '2024-01-15T10:00:00.000Z',
      },
    },
  })
  getDownloadUrl(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.fileUploadService.getDownloadUrl(id, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by ID (soft delete)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found.' })
  remove(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.fileUploadService.remove(id, companyId);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File permanently deleted.',
    type: SuccessResponseDto,
  })
  permanentDelete(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.company ? (req.user.company._id || req.user.company).toString() : undefined;
    return this.fileUploadService.permanentDelete(id, companyId);
  }
}
