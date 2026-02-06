import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

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

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Export extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: ExportType, required: true })
  type: ExportType;

  @Prop({ type: String, enum: ExportFormat, required: true })
  format: ExportFormat;

  @Prop({ type: String, enum: ExportStatus, default: ExportStatus.PENDING })
  status: ExportStatus;

  @Prop({ type: Object, default: {} })
  filters: Record<string, any>;

  @Prop({ type: [String], default: [] })
  fields: string[];

  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: Date, default: null })
  endDate: Date;

  @Prop({ type: Number, default: 0 })
  totalRecords: number;

  @Prop({ type: String, default: null })
  fileUrl: string;

  @Prop({ type: String, default: null })
  s3Key: string;

  @Prop({ type: Number, default: 0 })
  fileSize: number;

  @Prop({ type: String, default: null })
  error: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  completedAt: Date;
}

export const ExportSchema = SchemaFactory.createForClass(Export);

ExportSchema.index({ company: 1, requestedBy: 1, createdAt: -1 });
ExportSchema.index({ company: 1, status: 1 });
ExportSchema.index({ company: 1, type: 1 });
