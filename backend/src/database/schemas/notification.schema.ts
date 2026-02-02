import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, default: null })
  resourceType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, default: null })
  actionUrl: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  expiresAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ company: 1, user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ company: 1, user: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
