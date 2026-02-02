import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class EmailSettings extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  emailNotificationsEnabled: boolean;

  @Prop({ type: Object, default: {} })
  notifications: {
    disbursementCreated: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementDeptHeadPending: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementValidatorPending: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementCashierPending: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementCompleted: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    disbursementRejected: {
      enabled: boolean;
      recipients: string[];
      cc: string[];
    };
    userCreated: {
      enabled: boolean;
      recipients: string[];
    };
    passwordReset: {
      enabled: boolean;
    };
  };

  @Prop({ type: String })
  emailFooter: string;

  @Prop({ type: String })
  emailHeaderLogoUrl: string;

  @Prop({ type: String })
  fromEmail: string;

  @Prop({ type: String })
  fromName: string;
}

export const EmailSettingsSchema = SchemaFactory.createForClass(EmailSettings);

EmailSettingsSchema.index({ company: 1 }, { unique: true });
