import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ErrorLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  errorType: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String })
  stackTrace: string;

  @Prop({ type: String })
  endpoint: string;

  @Prop({ type: String })
  method: string;

  @Prop({ type: Object, default: {} })
  requestBody: Record<string, any>;

  @Prop({ type: Object, default: {} })
  requestParams: Record<string, any>;

  @Prop({ type: Object, default: {} })
  requestHeaders: Record<string, any>;

  @Prop({ type: String })
  environment: string;

  @Prop({ type: String })
  serverVersion: string;

  @Prop({ type: String })
  nodeVersion: string;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  })
  severity: string;

  @Prop({ type: Boolean, default: false })
  isResolved: boolean;

  @Prop({ type: Date, default: null })
  resolvedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  resolvedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  resolutionNotes: string;

  @Prop({ type: Boolean, default: false })
  emailSentToKaeyros: boolean;

  @Prop({ type: Date, default: null })
  emailSentAt: Date;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: String })
  errorHash: string;

  @Prop({ type: Number, default: 1 })
  occurrenceCount: number;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);

ErrorLogSchema.index({ company: 1, timestamp: -1 });
ErrorLogSchema.index({ severity: 1, isResolved: 1 });
ErrorLogSchema.index({ errorHash: 1 });
ErrorLogSchema.index({ emailSentToKaeyros: 1, timestamp: -1 });
