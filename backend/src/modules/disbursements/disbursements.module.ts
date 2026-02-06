import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Disbursement, DisbursementSchema } from '../../database/schemas/disbursement.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Company, CompanySchema } from '../../database/schemas/company.schema';
import { WorkflowTemplate, WorkflowTemplateSchema } from '../../database/schemas/workflow-template.schema';
import { DisbursementsService } from './disbursements.service';
import { DisbursementsController } from './disbursements.controller';
import { EmailModule } from '../../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Disbursement.name, schema: DisbursementSchema },
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: WorkflowTemplate.name, schema: WorkflowTemplateSchema },
    ]),
    EmailModule,
    NotificationsModule,
  ],
  controllers: [DisbursementsController],
  providers: [DisbursementsService],
  exports: [DisbursementsService],
})
export class DisbursementsModule {}
