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
import {
  DisbursementTemplate,
  DisbursementTemplateSchema,
} from './schemas/disbursement-template.schema';
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
import {
  PlatformSettings,
  PlatformSettingsSchema,
} from './schemas/platform-settings.schema';
import { FileUpload, FileUploadSchema } from './schemas/file-upload.schema';
import {
  PaymentMethod,
  PaymentMethodSchema,
} from './schemas/payment-method.schema';
import { Export, ExportSchema } from './schemas/export.schema';
import {
  WorkflowTemplate,
  WorkflowTemplateSchema,
} from './schemas/workflow-template.schema';
import { tenantFilterPlugin } from '../common/tenancy/tenant-filter.plugin';

function applyTenantPlugin(schema: any) {
  schema.plugin(tenantFilterPlugin);
  return schema;
}

const schemas = [
  { name: User.name, schema: applyTenantPlugin(UserSchema) },
  { name: Company.name, schema: CompanySchema },
  { name: Role.name, schema: applyTenantPlugin(RoleSchema) },
  { name: Permission.name, schema: PermissionSchema }, // Global permissions; no tenant filter
  { name: Department.name, schema: applyTenantPlugin(DepartmentSchema) },
  { name: Office.name, schema: applyTenantPlugin(OfficeSchema) },
  { name: Disbursement.name, schema: applyTenantPlugin(DisbursementSchema) },
  { name: Collection.name, schema: applyTenantPlugin(CollectionSchema) },
  {
    name: DisbursementType.name,
    schema: applyTenantPlugin(DisbursementTypeSchema),
  },
  { name: Beneficiary.name, schema: applyTenantPlugin(BeneficiarySchema) },
  {
    name: DisbursementTemplate.name,
    schema: applyTenantPlugin(DisbursementTemplateSchema),
  },
  { name: AuditLog.name, schema: applyTenantPlugin(AuditLogSchema) },
  { name: Notification.name, schema: applyTenantPlugin(NotificationSchema) },
  { name: ChatMessage.name, schema: applyTenantPlugin(ChatMessageSchema) },
  { name: DeletedDataRegistry.name, schema: DeletedDataRegistrySchema },
  { name: ErrorLog.name, schema: ErrorLogSchema },
  { name: EmailSettings.name, schema: applyTenantPlugin(EmailSettingsSchema) },
  {
    name: ReminderSettings.name,
    schema: applyTenantPlugin(ReminderSettingsSchema),
  },
  { name: PlatformSettings.name, schema: PlatformSettingsSchema },
  { name: FileUpload.name, schema: applyTenantPlugin(FileUploadSchema) },
  { name: PaymentMethod.name, schema: applyTenantPlugin(PaymentMethodSchema) },
  { name: Export.name, schema: applyTenantPlugin(ExportSchema) },
  {
    name: WorkflowTemplate.name,
    schema: applyTenantPlugin(WorkflowTemplateSchema),
  },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
