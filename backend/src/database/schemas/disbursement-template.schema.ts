import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';
import { PaymentType, DisbursementPriority } from '../../modules/disbursements/dto/create-disbursement.dto';

@Schema({ timestamps: true })
export class DisbursementTemplate extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DisbursementType', required: true })
  disbursementType: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Beneficiary', required: true })
  beneficiary: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: PaymentType, default: PaymentType.CASH })
  paymentMethod: PaymentType;

  @Prop({ type: String })
  purpose: string;

  @Prop({ type: String, enum: DisbursementPriority, default: DisbursementPriority.MEDIUM })
  priority: DisbursementPriority;

  @Prop({ type: Boolean, default: false })
  isUrgent: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const DisbursementTemplateSchema = SchemaFactory.createForClass(DisbursementTemplate);

DisbursementTemplateSchema.index({ company: 1, name: 1 });
