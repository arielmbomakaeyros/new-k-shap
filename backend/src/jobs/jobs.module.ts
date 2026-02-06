import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Disbursement, DisbursementSchema } from '../database/schemas/disbursement.schema';
import { Collection, CollectionSchema } from '../database/schemas/collection.schema';
import { User, UserSchema } from '../database/schemas/user.schema';
import { Notification, NotificationSchema } from '../database/schemas/notification.schema';
import { ErrorLog, ErrorLogSchema } from '../database/schemas/error-log.schema';
import { Company, CompanySchema } from '../database/schemas/company.schema';
import { SoftDeleteCleanupJob } from './soft-delete-cleanup.job';
import { DisbursementReminderJob } from './disbursement-reminder.job';
import { NotificationCleanupJob } from './notification-cleanup.job';
import { ErrorLogAlertJob } from './error-log-alert.job';
import { EmailDigestJob } from './email-digest.job';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Disbursement.name, schema: DisbursementSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ErrorLog.name, schema: ErrorLogSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  providers: [
    SoftDeleteCleanupJob,
    DisbursementReminderJob,
    NotificationCleanupJob,
    ErrorLogAlertJob,
    EmailDigestJob,
  ],
})
export class JobsModule {}
