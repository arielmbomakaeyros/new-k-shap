import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';
import { CompanyStatus } from './enums';

@Schema({ timestamps: true })
export class Company extends BaseEntity {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  industry: string;

  @Prop({ type: String, enum: CompanyStatus, default: CompanyStatus.TRIAL })
  status: CompanyStatus;

  @Prop({ type: Date })
  subscriptionStartDate: Date;

  @Prop({ type: Date })
  subscriptionEndDate: Date;

  @Prop({ type: Date })
  trialEndDate: Date;

  @Prop({ type: Object, default: {} })
  enabledFeatures: {
    disbursements: boolean;
    collections: boolean;
    chat: boolean;
    notifications: boolean;
    emailNotifications: boolean;
    reports: boolean;
    multiCurrency: boolean;
    apiAccess: boolean;
  };

  @Prop({
    type: Object,
    default: {
      requireDeptHeadApproval: true,
      requireValidatorApproval: true,
      requireCashierExecution: true,
      maxAmountNoApproval: 500000,
    },
  })
  workflowSettings: {
    requireDeptHeadApproval: boolean;
    requireValidatorApproval: boolean;
    requireCashierExecution: boolean;
    maxAmountNoApproval: number;
  };

  @Prop({
    type: Object,
    default: {
      onNewDisbursement: true,
      onDisbursementApproved: true,
      onDisbursementRejected: true,
      onCollectionAdded: true,
      dailySummary: false,
    },
  })
  emailNotificationSettings: {
    onNewDisbursement: boolean;
    onDisbursementApproved: boolean;
    onDisbursementRejected: boolean;
    onCollectionAdded: boolean;
    dailySummary: boolean;
  };

  @Prop({ type: String })
  planType: string;

  @Prop({ type: Number, default: 0 })
  maxUsers: number;

  @Prop({ type: Number, default: 0 })
  currentUserCount: number;

  @Prop({ type: String, default: 'XAF' })
  defaultCurrency: string;

  @Prop({ type: String, default: 'Africa/Douala' })
  timezone: string;

  @Prop({ type: [String], default: ['fr', 'en'] })
  supportedLanguages: string[];

  @Prop({ type: String, default: 'fr' })
  defaultLanguage: string;

  @Prop({ type: String })
  logoUrl: string;

  @Prop({ type: String })
  primaryColor: string;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  kaeyrosAccountManager: MongooseSchema.Types.ObjectId;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Virtual field to map 'status' to 'subscriptionStatus' for frontend compatibility
CompanySchema.virtual('subscriptionStatus').get(function() {
  // Map 'trial' to 'active' for frontend display
  if (this.status === 'trial') return 'active';
  return this.status;
});

// Virtual to provide 'id' field from '_id'
CompanySchema.virtual('id').get(function() {
  return this._id?.toHexString();
});

// Ensure virtuals are included when converting to JSON/Object
CompanySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    obj.id = obj._id?.toString();
    delete obj.__v;
    return obj;
  },
});
CompanySchema.set('toObject', { virtuals: true });

CompanySchema.index({ slug: 1 });
CompanySchema.index({ status: 1, isDeleted: 1 });
