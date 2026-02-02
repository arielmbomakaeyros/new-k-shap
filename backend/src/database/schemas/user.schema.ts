import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './base-entity.schema';
import { UserRole } from './enums';

@Schema({ timestamps: true })
export class User extends BaseEntity {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, trim: true })
  phone: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isKaeyrosUser: boolean;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }],
    default: [],
  })
  roles: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [String], enum: UserRole, default: [] })
  systemRoles: UserRole[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Department' }],
    default: [],
  })
  departments: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Office' }],
    default: [],
  })
  offices: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  canLogin: boolean;

  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop({ type: String, default: null })
  activationToken: string;

  @Prop({ type: Date, default: null })
  activationTokenExpiry: Date;

  @Prop({ type: String, default: null })
  passwordResetToken: string;

  @Prop({ type: Date, default: null })
  passwordResetExpiry: Date;

  @Prop({ type: String, default: null })
  refreshToken: string;

  @Prop({ type: Date, default: null })
  lastLogin: Date;

  @Prop({ type: String, default: null })
  lastLoginIp: string;

  @Prop({ type: Object, default: {} })
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    disbursementCreated: boolean;
    disbursementValidated: boolean;
    disbursementRejected: boolean;
    disbursementCompleted: boolean;
    chatMessages: boolean;
    systemAlerts: boolean;
  };

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String, default: 'fr' })
  preferredLanguage: string;

  @Prop({ type: Number, default: null })
  maxApprovalAmount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ company: 1, isDeleted: 1 });
UserSchema.index({ isKaeyrosUser: 1 });
