import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class Beneficiary extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    enum: ['individual', 'company', 'supplier', 'employee', 'other'],
    default: 'individual',
  })
  type: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'DisbursementType',
    default: null,
  })
  disbursementType: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  bankName: string;

  @Prop({ type: String })
  accountNumber: string;

  @Prop({ type: String })
  taxId: string;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: Number, default: 0 })
  totalDisbursed: number;
}

export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);

BeneficiarySchema.index({ company: 1, isDeleted: 1 });
