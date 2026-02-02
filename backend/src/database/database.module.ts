import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Import all schemas
import { User, UserSchema } from './schemas/user.schema';
import { Company, CompanySchema } from './schemas/company.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { Office, OfficeSchema } from './schemas/office.schema';
import {
  Disbursement,
  DisbursementSchema,
} from './schemas/disbursement.schema';
import { Collection, CollectionSchema } from './schemas/collection.schema';
import {
  DisbursementType,
  DisbursementTypeSchema,
} from './schemas/disbursement-type.schema';
import { Beneficiary, BeneficiarySchema } from './schemas/beneficiary.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import {
  DeletedDataRegistry,
  DeletedDataRegistrySchema,
} from './schemas/deleted-data-registry.schema';
import { ErrorLog, ErrorLogSchema } from './schemas/error-log.schema';
import {
  EmailSettings,
  EmailSettingsSchema,
} from './schemas/email-settings.schema';
import {
  ReminderSettings,
  ReminderSettingsSchema,
} from './schemas/reminder-settings.schema';

const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Company.name, schema: CompanySchema },
  { name: Role.name, schema: RoleSchema },
  { name: Permission.name, schema: PermissionSchema },
  { name: Department.name, schema: DepartmentSchema },
  { name: Office.name, schema: OfficeSchema },
  { name: Disbursement.name, schema: DisbursementSchema },
  { name: Collection.name, schema: CollectionSchema },
  { name: DisbursementType.name, schema: DisbursementTypeSchema },
  { name: Beneficiary.name, schema: BeneficiarySchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: Notification.name, schema: NotificationSchema },
  { name: ChatMessage.name, schema: ChatMessageSchema },
  { name: DeletedDataRegistry.name, schema: DeletedDataRegistrySchema },
  { name: ErrorLog.name, schema: ErrorLogSchema },
  { name: EmailSettings.name, schema: EmailSettingsSchema },
  { name: ReminderSettings.name, schema: ReminderSettingsSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
