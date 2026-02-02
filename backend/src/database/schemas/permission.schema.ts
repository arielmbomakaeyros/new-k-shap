import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';
import { PermissionResource, PermissionAction } from './enums';

@Schema({ timestamps: true })
export class Permission extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: false })
  company?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  code: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: PermissionResource, required: true })
  resource: PermissionResource;

  @Prop({ type: String, enum: PermissionAction, required: true })
  action: PermissionAction;

  @Prop({ type: Boolean, default: false })
  isSystemPermission: boolean;

  @Prop({ type: Object, default: null })
  conditions: {
    maxAmount?: number;
    departmentRestricted?: boolean;
    officeRestricted?: boolean;
  };
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Index for company-specific permissions
PermissionSchema.index({ company: 1, code: 1 }, { unique: true, partialFilterExpression: { company: { $exists: true } } });
// Index for system-level permissions (without company)
PermissionSchema.index({ code: 1 }, { unique: true, partialFilterExpression: { company: { $exists: false } } });
