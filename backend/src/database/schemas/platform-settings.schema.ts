import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PlatformSettings extends Document {
  @Prop({ type: String, default: 'platform', unique: true })
  key: string;

  @Prop({
    type: Object,
    default: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      fromEmail: '',
    },
  })
  emailConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    fromEmail: string;
  };

  @Prop({
    type: Object,
    default: {
      sendErrorAlerts: true,
      dailyActivitySummary: true,
      suspiciousLoginAlerts: true,
      subscriptionReminders: true,
    },
  })
  notifications: {
    sendErrorAlerts: boolean;
    dailyActivitySummary: boolean;
    suspiciousLoginAlerts: boolean;
    subscriptionReminders: boolean;
  };

  @Prop({
    type: [
      {
        name: String,
        price: Number,
        billingPeriod: { type: String, default: 'monthly' },
        maxUsers: Number,
        features: [String],
      },
    ],
    default: [],
  })
  subscriptionPlans: Array<{
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    maxUsers: number;
    features: string[];
  }>;

  @Prop({
    type: Object,
    default: {
      apiBaseUrl: '',
      rateLimitingEnabled: true,
      rateLimit: 60,
    },
  })
  apiConfig: {
    apiBaseUrl: string;
    rateLimitingEnabled: boolean;
    rateLimit: number;
  };

  @Prop({
    type: Object,
    default: {
      primaryColor: '#1d4ed8',
      logoUrl: '',
    },
  })
  branding: {
    primaryColor: string;
    logoUrl: string;
  };

  @Prop({
    type: Object,
    default: {
      deptHeadHours: 24,
      validatorHours: 24,
      cashierHours: 24,
    },
  })
  slaThresholds: {
    deptHeadHours: number;
    validatorHours: number;
    cashierHours: number;
  };

  @Prop({ type: Number, default: 365 })
  auditLogRetentionDays: number;

  @Prop({
    type: Object,
    default: {
      name: 'Default',
      stages: ['department_head', 'validator', 'cashier'],
    },
  })
  defaultWorkflowTemplate: {
    name: string;
    stages: string[];
  };

  @Prop({ type: Number, default: 7 })
  billingGracePeriodDays: number;

  @Prop({
    type: Object,
    default: {
      enabled: false,
      url: '',
      secret: '',
    },
  })
  webhookSettings: {
    enabled: boolean;
    url: string;
    secret: string;
  };

  @Prop({ type: [String], default: [] })
  emailDomainsAllowlist: string[];

  @Prop({
    type: Object,
    default: {
      free: { disbursements: true, collections: true },
      starter: { disbursements: true, collections: true, reports: true },
      professional: { disbursements: true, collections: true, reports: true, apiAccess: true },
      enterprise: { disbursements: true, collections: true, reports: true, apiAccess: true, multiCurrency: true },
    },
  })
  featureFlagsByPlan: Record<string, Record<string, boolean>>;
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
