import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { Export, ExportFormat, ExportStatus, ExportType } from '../../database/schemas/export.schema';
import { Disbursement } from '../../database/schemas/disbursement.schema';
import { Collection } from '../../database/schemas/collection.schema';
import { User } from '../../database/schemas/user.schema';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CreateFileUploadDto, FileCategory } from '../file-upload/dto';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    @InjectModel(Export.name) private exportModel: Model<Export>,
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private buildCompanyFilter(companyId?: string | null) {
    return companyId ? { company: new Types.ObjectId(companyId) } : {};
  }

  async create(createExportDto: any, companyId?: string | null, userId?: string) {
    if (createExportDto.format === ExportFormat.PDF) {
      throw new BadRequestException('PDF export is coming soon');
    }

    const exportRecord = new this.exportModel({
      ...createExportDto,
      name: createExportDto.name || `${createExportDto.type}_export_${Date.now()}`,
      company: companyId ? new Types.ObjectId(companyId) : undefined,
      requestedBy: userId ? new Types.ObjectId(userId) : undefined,
      status: ExportStatus.PROCESSING,
    });
    await exportRecord.save();

    // Process export asynchronously (but within same request for simplicity)
    this.processExport(exportRecord._id.toString(), companyId).catch((err) => {
      this.logger.error(`Export processing failed: ${err.message}`, err.stack);
    });

    return exportRecord;
  }

  private async processExport(exportId: string, companyId?: string | null) {
    const exportRecord = await this.exportModel.findById(exportId);
    if (!exportRecord) return;

    try {
      const data = await this.queryData(exportRecord.type, companyId, exportRecord.filters, exportRecord.startDate, exportRecord.endDate);
      exportRecord.totalRecords = data.length;

      let buffer: Buffer;
      let contentType: string;
      let extension: string;

      switch (exportRecord.format) {
        case ExportFormat.CSV:
          buffer = Buffer.from(this.generateCsv(data, exportRecord.type));
          contentType = 'text/csv';
          extension = 'csv';
          break;
        case ExportFormat.EXCEL:
          buffer = Buffer.from(await this.generateExcel(data, exportRecord.type));
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        case ExportFormat.JSON:
          buffer = Buffer.from(JSON.stringify(data, null, 2));
          contentType = 'application/json';
          extension = 'json';
          break;
        default:
          throw new Error(`Unsupported format: ${exportRecord.format}`);
      }

      // Store the file via FileUploadService
      const file = {
        originalname: `${exportRecord.name}.${extension}`,
        buffer,
        mimetype: contentType,
        size: buffer.length,
      };
      const uploadBody: CreateFileUploadDto = {
        category: FileCategory.REPORT,
        description: `Export file for ${exportRecord.name}`,
        tags: 'export',
      };
      const uploadContext = {
        userId: exportRecord.requestedBy?.toString() || 'system',
        companyId,
      };
      const uploaded = await this.fileUploadService.uploadFile(
        file as any,
        uploadBody,
        uploadContext,
      );

      exportRecord.fileUrl = uploaded.url || uploaded.id;
      exportRecord.s3Key = uploaded.storedName;
      exportRecord.fileSize = buffer.length;
      exportRecord.status = ExportStatus.COMPLETED;
      exportRecord.completedAt = new Date();
      await exportRecord.save();
    } catch (error) {
      exportRecord.status = ExportStatus.FAILED;
      exportRecord.error = error.message;
      await exportRecord.save();
    }
  }

  private async queryData(
    type: ExportType,
    companyId?: string | null,
    filters?: Record<string, any>,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const companyFilter = this.buildCompanyFilter(companyId);
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    switch (type) {
      case ExportType.DISBURSEMENTS: {
        const query: any = { isDeleted: false, ...companyFilter, ...filters };
        if (startDate || endDate) query.createdAt = dateFilter;
        return this.disbursementModel.find(query).populate('beneficiary department office disbursementType').lean();
      }
      case ExportType.COLLECTIONS: {
        const query: any = { isDeleted: false, ...companyFilter, ...filters };
        if (startDate || endDate) query.collectionDate = dateFilter;
        return this.collectionModel.find(query).populate('department office').lean();
      }
      case ExportType.USERS: {
        const query: any = { isDeleted: false, ...companyFilter, ...filters };
        if (startDate || endDate) query.createdAt = dateFilter;
        return this.userModel.find(query).select('-password -passwordResetToken -passwordResetExpires').lean();
      }
      default:
        return [];
    }
  }

  private generateCsv(data: any[], type: ExportType): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).filter((k) => k !== '__v');
    const escape = (value: any) => {
      const str = value === null || value === undefined ? '' : String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [
      headers.map(escape).join(','),
      ...data.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ];
    return lines.join('\n');
  }

  private async generateExcel(data: any[], type: ExportType): Promise<ArrayBuffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type);

    if (data.length === 0) {
      return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
    }

    const headers = Object.keys(data[0]).filter((k) => k !== '__v');
    sheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    data.forEach((row) => {
      const rowData: Record<string, any> = {};
      headers.forEach((h) => {
        const val = row[h];
        rowData[h] = typeof val === 'object' ? JSON.stringify(val) : val;
      });
      sheet.addRow(rowData);
    });

    sheet.getRow(1).font = { bold: true };
    return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
  }

  async findAll(companyId?: string | null, page = 1, limit = 10) {
    const filter = {
      isDeleted: false,
      ...this.buildCompanyFilter(companyId),
    };

    const [data, total] = await Promise.all([
      this.exportModel
        .find(filter as any)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('requestedBy', 'firstName lastName email')
        .lean(),
      this.exportModel.countDocuments(filter as any),
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

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...this.buildCompanyFilter(companyId),
    };

    const exportRecord = await this.exportModel.findOne(filter as any)
      .populate('requestedBy', 'firstName lastName email')
      .lean();

    if (!exportRecord) {
      throw new NotFoundException(`Export with ID ${id} not found`);
    }

    return exportRecord;
  }

  async getDownloadUrl(id: string, companyId?: string | null) {
    const exportRecord = await this.findOne(id, companyId);

    if (exportRecord.status !== ExportStatus.COMPLETED) {
      throw new BadRequestException('Export is not yet completed');
    }

    if (!exportRecord.s3Key && !exportRecord.fileUrl) {
      throw new NotFoundException('Export file not found');
    }

    // Use the fileUrl as the ID to get download URL from FileUploadService
    const fileId = exportRecord.fileUrl;
    return this.fileUploadService.getDownloadUrl(fileId, companyId);
  }

  async remove(id: string, companyId?: string | null) {
    const exportRecord = await this.findOne(id, companyId);

    // Delete from S3 if file exists
    if (exportRecord.fileUrl) {
      try {
        await this.fileUploadService.permanentDelete(exportRecord.fileUrl, companyId);
      } catch (err) {
        this.logger.warn(`Failed to delete S3 file for export ${id}: ${err.message}`);
      }
    }

    await this.exportModel.findByIdAndDelete(id);
    return { success: true, message: 'Export deleted successfully' };
  }
}
