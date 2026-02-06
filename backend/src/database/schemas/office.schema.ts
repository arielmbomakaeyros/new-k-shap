import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class Office extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  code: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  manager: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  userCount: number;
}

export const OfficeSchema = SchemaFactory.createForClass(Office);

OfficeSchema.index({ company: 1, isDeleted: 1 });
OfficeSchema.index({ company: 1, createdAt: -1, isDeleted: 1 });
