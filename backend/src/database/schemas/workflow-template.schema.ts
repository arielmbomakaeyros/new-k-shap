import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ _id: false, timestamps: false })
export class WorkflowTemplateStep {
  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  roleRequired: string;

  @Prop({ type: Boolean, default: false })
  isOptional: boolean;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  statusOnPending: string;

  @Prop({ type: String })
  statusOnComplete: string;
}

export const WorkflowTemplateStepSchema = SchemaFactory.createForClass(WorkflowTemplateStep);

@Schema({ timestamps: true })
export class WorkflowTemplate extends BaseEntity {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  @Prop({ type: [WorkflowTemplateStepSchema], default: [] })
  steps: WorkflowTemplateStep[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  declare createdBy: MongooseSchema.Types.ObjectId;
}

export const WorkflowTemplateSchema = SchemaFactory.createForClass(WorkflowTemplate);

WorkflowTemplateSchema.index({ company: 1, isDefault: 1 });
WorkflowTemplateSchema.index({ isSystem: 1 });
