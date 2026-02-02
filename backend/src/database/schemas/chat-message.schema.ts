import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class ChatMessage extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Disbursement',
    default: null,
  })
  disbursement: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ['disbursement', 'general', 'department', 'office'],
    default: 'general',
  })
  chatType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  recipient: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  participants: MongooseSchema.Types.ObjectId[];

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null,
  })
  replyTo: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  readBy: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  readAt: { [userId: string]: Date };

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Date, default: null })
  editedAt: Date;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ company: 1, disbursement: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
ChatMessageSchema.index({ participants: 1, createdAt: -1 });
