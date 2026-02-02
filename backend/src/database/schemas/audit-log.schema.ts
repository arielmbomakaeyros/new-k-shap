import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ActionType } from './enums';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isKaeyrosAction: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  userEmail: string;

  @Prop({ type: String })
  userName: string;

  @Prop({ type: String })
  userRole: string;

  @Prop({ type: String, enum: ActionType, required: true })
  action: ActionType;

  @Prop({ type: String, required: true })
  actionDescription: string;

  @Prop({ type: String, required: true })
  resourceType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, default: null })
  resourceName: string;

  @Prop({ type: Object, default: null })
  previousValues: Record<string, any>;

  @Prop({ type: Object, default: null })
  newValues: Record<string, any>;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  userAgent: string;

  @Prop({ type: String })
  endpoint: string;

  @Prop({ type: String })
  method: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  })
  severity: string;

  @Prop({ type: String, enum: ['success', 'failure'], default: 'success' })
  status: string;

  @Prop({ type: String, default: null })
  errorMessage: string;

  @Prop({ type: Boolean, default: false })
  flaggedForReview: boolean;

  @Prop({ type: String, default: null })
  reviewNotes: string;

  @Prop({ type: Boolean, default: false })
  isChatAction: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null,
  })
  chatMessageId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  chatRecipient: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ company: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, user: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ isKaeyrosAction: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
