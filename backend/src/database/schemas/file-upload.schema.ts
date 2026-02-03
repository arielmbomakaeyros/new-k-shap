import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileUploadDocument = FileUpload & Document;

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

@Schema({ timestamps: true })
export class FileUpload {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  storedName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ required: true, enum: FileCategory })
  category: FileCategory;

  @Prop({ enum: FileEntityType })
  entityType?: FileEntityType;

  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const FileUploadSchema = SchemaFactory.createForClass(FileUpload);

// Add indexes for better query performance
FileUploadSchema.index({ company: 1, entityType: 1, entityId: 1 });
FileUploadSchema.index({ company: 1, category: 1 });
FileUploadSchema.index({ company: 1, createdAt: -1 });

// Virtual for id
FileUploadSchema.virtual('id').get(function () {
  return this._id?.toString();
});

FileUploadSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    const obj = ret as any;
    obj.id = obj._id?.toString();
    delete obj.__v;
    return obj;
  },
});
