import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';

@Schema({ timestamps: true })
export class ReminderSettings extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  remindersEnabled: boolean;

  @Prop({ type: [Number], default: [2880, 1440, 180, 45, 15] })
  reminderIntervals: number[];

  @Prop({ type: Object, default: {} })
  recipientRoles: {
    pendingDeptHead: string[];
    pendingValidator: string[];
    pendingCashier: string[];
  };

  @Prop({ type: Boolean, default: true })
  emailReminders: boolean;

  @Prop({ type: Boolean, default: true })
  inAppReminders: boolean;

  @Prop({ type: Boolean, default: false })
  smsReminders: boolean;
}

export const ReminderSettingsSchema =
  SchemaFactory.createForClass(ReminderSettings);

ReminderSettingsSchema.index({ company: 1 }, { unique: true });
