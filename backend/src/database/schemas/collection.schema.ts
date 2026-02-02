import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';
import { PaymentType } from './enums';
import { DisbursementAction, DisbursementActionSchema } from './disbursement.schema';

@Schema({ timestamps: true })
export class Collection extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  referenceNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  @Prop({ type: String, required: true })
  buyerName: string;

  @Prop({ type: String })
  buyerCompanyName: string;

  @Prop({ type: String })
  buyerEmail: string;

  @Prop({ type: String })
  buyerPhone: string;

  @Prop({ type: String })
  sellerName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  handledBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: PaymentType, required: true })
  paymentType: PaymentType;

  @Prop({ type: String })
  productType: string;

  @Prop({ type: String })
  serviceCategory: string;

  @Prop({ type: Number })
  totalAmount: number;

  @Prop({ type: Number })
  advancePayment: number;

  @Prop({ type: Number })
  remainingBalance: number;

  @Prop({ type: Boolean, default: false })
  isFullyPaid: boolean;

  @Prop({ type: Date, required: true })
  collectionDate: Date;

  @Prop({ type: Date, default: null })
  expectedFullPaymentDate: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    default: null,
  })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  invoices: string[];

  @Prop({ type: [String], default: [] })
  receipts: string[];

  @Prop({ type: [String], default: [] })
  contracts: string[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: String })
  comment: string;

  @Prop({ type: String })
  internalNotes: string;

  @Prop({ type: String })
  revenueCategory: string;

  @Prop({ type: String })
  activityType: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  projectReference: string;

  @Prop({ type: String })
  contractReference: string;

  @Prop({ type: [DisbursementActionSchema], default: [] })
  actionHistory: DisbursementAction[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

CollectionSchema.index({ company: 1, referenceNumber: 1 }, { unique: true });
CollectionSchema.index({ company: 1, collectionDate: -1, isDeleted: 1 });
CollectionSchema.index({ company: 1, isFullyPaid: 1, isDeleted: 1 });
