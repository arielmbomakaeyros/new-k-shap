import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileUpload, FileUploadDocument } from '../../database/schemas/file-upload.schema';
import { CreateFileUploadDto, FileCategory, FileEntityType } from './dto';

export interface FileUploadResult {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  tags: string[];
  uploadedBy: any;
  createdAt: Date;
}

export interface UploadContext {
  userId: string;
  companyId?: string | null;
}

@Injectable()
export class FileUploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    @InjectModel(FileUpload.name) private fileUploadModel: Model<FileUploadDocument>,
    private readonly configService: ConfigService,
  ) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_KEY');
    this.bucketName = this.configService.get<string>('BUCKETNAME') || 'kshap-uploads';

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not configured. File uploads will fail. Please set AWS_ACCESS_KEY and AWS_SECRET_KEY environment variables.',
      );
    }

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'eu-central-1'),
      credentials: accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
    });
  }

  /**
   * Validates if a file is acceptable for upload
   */
  isValidFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return allowedMimeTypes.includes(file.mimetype) && file.size <= maxSize;
  }

  /**
   * Generates a unique file name for S3 storage
   */
  private generateFileName(originalName: string, entityType?: string, entityId?: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '_');

    if (entityType && entityId) {
      return `${entityType}/${entityId}/${timestamp}_${randomStr}_${baseName}.${extension}`;
    }
    return `uploads/${timestamp}_${randomStr}_${baseName}.${extension}`;
  }

  /**
   * Uploads a file to S3 and saves metadata to database
   */
  async uploadFile(
    file: Express.Multer.File,
    body: CreateFileUploadDto,
    context: UploadContext,
  ): Promise<FileUploadResult> {
    const companyId = context.companyId;
    if (!companyId) {
      throw new BadRequestException('Company context is required for file uploads');
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.isValidFile(file)) {
      throw new BadRequestException(
        'Invalid file. Allowed types: images, PDF, Word, Excel. Max size: 10MB',
      );
    }

    try {
      // Generate unique file name
      const storedName = this.generateFileName(
        file.originalname,
        body.entityType,
        body.entityId,
      );

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storedName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.amazonaws.com/${storedName}`;
      this.logger.log(`File uploaded successfully to S3: ${url}`);

      // Parse tags if provided
      const tags = body.tags ? body.tags.split(',').map((t) => t.trim()) : [];

      // Save file metadata to database
      const fileUpload = new this.fileUploadModel({
        company: new Types.ObjectId(companyId),
        originalName: file.originalname,
        storedName,
        mimeType: file.mimetype,
        size: file.size,
        url,
        s3Key: storedName,
        category: body.category,
        entityType: body.entityType,
        entityId: body.entityId ? new Types.ObjectId(body.entityId) : undefined,
        description: body.description,
        tags,
        uploadedBy: new Types.ObjectId(context.userId),
      });

      const saved = await fileUpload.save();
      await saved.populate('uploadedBy', 'firstName lastName email');

      return {
        id: saved._id.toString(),
        originalName: saved.originalName,
        storedName: saved.storedName,
        mimeType: saved.mimeType,
        size: saved.size,
        url: saved.url,
        category: saved.category,
        entityType: saved.entityType,
        entityId: saved.entityId?.toString(),
        description: saved.description,
        tags: saved.tags,
        uploadedBy: saved.uploadedBy,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Uploads multiple files at once
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    body: CreateFileUploadDto,
    context: UploadContext,
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, body, context);
      results.push(result);
    }

    return results;
  }

  /**
   * Create file record (for external storage references)
   */
  async create(createFileUploadDto: CreateFileUploadDto, context: UploadContext) {
    const companyId = context.companyId;
    if (!companyId) {
      throw new BadRequestException('Company context is required for file uploads');
    }
    const tags = createFileUploadDto.tags
      ? createFileUploadDto.tags.split(',').map((t) => t.trim())
      : [];

    const fileUpload = new this.fileUploadModel({
      company: new Types.ObjectId(companyId),
      ...createFileUploadDto,
      tags,
      uploadedBy: new Types.ObjectId(context.userId),
    });

    return fileUpload.save();
  }

  /**
   * Find all files with filtering and pagination
   */
  async findAll(
    companyId?: string | null,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      category?: FileCategory;
      entityType?: FileEntityType;
      entityId?: string;
      search?: string;
      mimeType?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      entityType,
      entityId,
      search,
      mimeType,
      startDate,
      endDate,
    } = options;

    const query: any = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };

    if (category) query.category = category;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = new Types.ObjectId(entityId);
    if (mimeType) query.mimeType = mimeType;

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.fileUploadModel
        .find(query)
        .populate('uploadedBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.fileUploadModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find files by entity (e.g., all files for a specific disbursement)
   */
  async findByEntity(
    companyId: string | null | undefined,
    entityType: FileEntityType,
    entityId: string,
  ) {
    return this.fileUploadModel
      .find({
        entityType,
        entityId: new Types.ObjectId(entityId),
        isDeleted: false,
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find one file by ID
   */
  async findOne(id: string, companyId?: string | null) {
    const file = await this.fileUploadModel
      .findOne({
        _id: new Types.ObjectId(id),
        isDeleted: false,
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      })
      .populate('uploadedBy', 'firstName lastName email')
      .exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Get a signed download URL for a file (expires in 1 hour)
   */
  async getDownloadUrl(id: string, companyId?: string | null) {
    const file = await this.findOne(id, companyId);

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.s3Key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return {
      downloadUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  /**
   * Update file metadata
   */
  async update(
    id: string,
    updateDto: Partial<CreateFileUploadDto>,
    companyId?: string | null,
  ) {
    const file = await this.findOne(id, companyId);

    if (updateDto.tags) {
      (updateDto as any).tags = updateDto.tags.split(',').map((t) => t.trim());
    }

    Object.assign(file, updateDto);
    return file.save();
  }

  /**
   * Soft delete a file (mark as deleted but keep in S3)
   */
  async remove(id: string, companyId?: string | null) {
    const file = await this.findOne(id, companyId);
    file.isDeleted = true;
    await file.save();

    return { success: true, message: 'File deleted successfully' };
  }

  /**
   * Permanently delete a file from S3 and database
   */
  async permanentDelete(id: string, companyId?: string | null) {
    const file = await this.fileUploadModel
      .findOne({
        _id: new Types.ObjectId(id),
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      })
      .exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Delete from S3
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: file.s3Key,
      });
      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${file.s3Key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${error.message}`);
    }

    // Delete from database
    await this.fileUploadModel.deleteOne({ _id: file._id });

    return { success: true, message: 'File permanently deleted' };
  }
}
