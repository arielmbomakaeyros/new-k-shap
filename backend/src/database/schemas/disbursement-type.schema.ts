import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class DisbursementType extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  code: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: Boolean, default: true })
  requiresDeptHeadValidation: boolean;

  @Prop({ type: Boolean, default: true })
  requiresValidatorApproval: boolean;

  @Prop({ type: Boolean, default: true })
  requiresCashierExecution: boolean;

  @Prop({ type: Number, default: null })
  autoApproveUnder: number;

  @Prop({ type: String })
  icon: string;

  @Prop({ type: String })
  color: string;
}

export const DisbursementTypeSchema =
  SchemaFactory.createForClass(DisbursementType);

DisbursementTypeSchema.index({ company: 1, isDeleted: 1 });
