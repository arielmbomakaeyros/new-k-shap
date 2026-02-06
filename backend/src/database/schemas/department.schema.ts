import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class Department extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  code: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  head: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    default: null,
  })
  parentDepartment: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  userCount: number;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.index({ company: 1, isDeleted: 1 });
DepartmentSchema.index({ company: 1, createdAt: -1, isDeleted: 1 });
