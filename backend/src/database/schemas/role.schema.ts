import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class Role extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isSystemRole: boolean;

  @Prop({ type: String, default: null })
  systemRoleType: string;

  @Prop({ type: Number, default: 0 })
  hierarchyLevel: number;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ company: 1, name: 1 });
RoleSchema.index({ company: 1, createdAt: -1, isDeleted: 1 });
