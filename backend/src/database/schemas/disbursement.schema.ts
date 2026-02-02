import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';
import { DisbursementStatus, PaymentType, DisbursementActionType } from './enums';

// Disbursement Action sub-schema
@Schema({ _id: false, timestamps: false })
export class DisbursementAction {
  @Prop({ type: String, enum: DisbursementActionType, required: true })
  action: DisbursementActionType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  performedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  performedByName: string;

  @Prop({ type: String })
  performedByRole: string;

  @Prop({ type: Date, required: true, default: Date.now })
  performedAt: Date;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: String })
  reason: string;

  @Prop({ type: Object, default: {} })
  metadata: {
    previousStatus?: string;
    newStatus?: string;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    undoneAction?: {
      actionId: string;
      originalAction: string;
      originalPerformedBy: string;
      originalPerformedAt: Date;
    };
  };
}

export const DisbursementActionSchema =
  SchemaFactory.createForClass(DisbursementAction);

// Workflow Step sub-schema
@Schema({ _id: false, timestamps: false })
export class WorkflowStep {
  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'skipped', 'undone'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Date, default: null })
  completedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  completedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: [DisbursementActionSchema], default: [] })
  history: DisbursementAction[];

  @Prop({ type: String })
  rejectionReason: string;

  @Prop({ type: Boolean, default: false })
  wasSkipped: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  skippedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  skippedAt: Date;

  @Prop({ type: Boolean, default: false })
  wasUndone: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  undoneBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  undoneAt: Date;

  @Prop({ type: String })
  undoReason: string;
}

export const WorkflowStepSchema = SchemaFactory.createForClass(WorkflowStep);

// Main Disbursement Schema
@Schema({ timestamps: true })
export class Disbursement extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  referenceNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: 'XAF' })
  currency: string;

  @Prop({
    type: String,
    enum: DisbursementStatus,
    default: DisbursementStatus.DRAFT,
  })
  status: DisbursementStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'DisbursementType',
    required: true,
  })
  disbursementType: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Beneficiary',
    required: true,
  })
  beneficiary: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  purpose: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    required: true,
  })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office', default: null })
  office: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: PaymentType, default: PaymentType.CASH })
  paymentMethod: PaymentType;

  @Prop({ type: Date, default: null })
  expectedPaymentDate: Date;

  @Prop({ type: Date, default: null })
  actualPaymentDate: Date;

  @Prop({ type: [String], default: [] })
  invoices: string[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  // Workflow Steps
  @Prop({ type: WorkflowStepSchema, default: {} })
  agentSubmission: WorkflowStep;

  @Prop({ type: WorkflowStepSchema, default: {} })
  deptHeadValidation: WorkflowStep;

  @Prop({ type: WorkflowStepSchema, default: {} })
  validatorApproval: WorkflowStep;

  @Prop({ type: WorkflowStepSchema, default: {} })
  cashierExecution: WorkflowStep;

  // Complete Action History
  @Prop({ type: [DisbursementActionSchema], default: [] })
  actionHistory: DisbursementAction[];

  // Status Timeline
  @Prop({ type: Object, default: {} })
  statusTimeline: {
    draft?: Date;
    pendingDeptHead?: Date;
    pendingValidator?: Date;
    pendingCashier?: Date;
    completed?: Date;
    rejected?: Date;
    cancelled?: Date;
  };

  // Force Completion
  @Prop({ type: Boolean, default: false })
  forceCompleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  forceCompletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  forceCompletedAt: Date;

  @Prop({ type: String, default: null })
  forceCompletionReason: string;

  @Prop({ type: Boolean, default: false })
  forceCompletionUndone: boolean;

  // Retroactive Marking
  @Prop({ type: Boolean, default: false })
  isRetroactive: boolean;

  @Prop({ type: String, default: null })
  retroactiveReason: string;

  @Prop({ type: Date, default: null })
  retroactiveMarkedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  retroactiveMarkedBy: MongooseSchema.Types.ObjectId;

  // Rejection Tracking
  @Prop({ type: Object, default: null })
  currentRejection: {
    rejectedBy: MongooseSchema.Types.ObjectId;
    rejectedAt: Date;
    stage: string;
    reason: string;
    wasUndone: boolean;
  };

  @Prop({ type: Array, default: [] })
  rejectionHistory: Array<{
    rejectedBy: MongooseSchema.Types.ObjectId;
    rejectedAt: Date;
    stage: string;
    reason: string;
    undoneBy?: MongooseSchema.Types.ObjectId;
    undoneAt?: Date;
    undoReason?: string;
  }>;

  // Completion
  @Prop({ type: Date, default: null })
  completedAt: Date;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  // Additional Fields
  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: string;

  @Prop({ type: Date, default: null })
  deadline: Date;

  @Prop({ type: Boolean, default: false })
  isUrgent: boolean;

  @Prop({ type: Boolean, default: false })
  requiresFollowUp: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  internalNotes: string;

  @Prop({ type: Array, default: [] })
  comments: Array<{
    user: MongooseSchema.Types.ObjectId;
    userName: string;
    comment: string;
    createdAt: Date;
  }>;

  @Prop({ type: Object, default: {} })
  undoPermissions: {
    canUndoDeptHeadValidation: boolean;
    canUndoValidatorApproval: boolean;
    canUndoCashierExecution: boolean;
    canUndoRejection: boolean;
    canUndoForceCompletion: boolean;
  };
}

export const DisbursementSchema = SchemaFactory.createForClass(Disbursement);

DisbursementSchema.index(
  { company: 1, referenceNumber: 1 },
  { unique: true },
);
DisbursementSchema.index({ company: 1, status: 1, isDeleted: 1 });
DisbursementSchema.index({ company: 1, department: 1, isDeleted: 1 });
DisbursementSchema.index({ company: 1, createdAt: -1 });
DisbursementSchema.index({ beneficiary: 1, isDeleted: 1 });
DisbursementSchema.index({ 'actionHistory.performedAt': -1 });
