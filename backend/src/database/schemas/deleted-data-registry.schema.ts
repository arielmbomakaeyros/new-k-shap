import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class DeletedDataRegistry extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  resourceType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  resourceName: string;

  @Prop({ type: Object, default: {} })
  resourceSnapshot: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  deletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  deletedAt: Date;

  @Prop({ type: String })
  deletionReason: string;

  @Prop({ type: Date, required: true })
  permanentDeleteScheduledFor: Date;

  @Prop({ type: Boolean, default: false })
  isRestored: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  restoredBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  restoredAt: Date;

  @Prop({ type: Boolean, default: false })
  isPermanentlyDeleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  permanentlyDeletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  permanentlyDeletedAt: Date;

  @Prop({ type: Boolean, default: false })
  requiresKaeyrosApproval: boolean;

  @Prop({ type: Boolean, default: false })
  approvedByKaeyros: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId;
}

export const DeletedDataRegistrySchema =
  SchemaFactory.createForClass(DeletedDataRegistry);

DeletedDataRegistrySchema.index({
  company: 1,
  permanentDeleteScheduledFor: 1,
});
DeletedDataRegistrySchema.index({
  company: 1,
  isRestored: 1,
  isPermanentlyDeleted: 1,
});
