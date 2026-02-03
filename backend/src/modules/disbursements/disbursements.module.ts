import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Disbursement, DisbursementSchema } from '../../database/schemas/disbursement.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Company, CompanySchema } from '../../database/schemas/company.schema';
import { DisbursementsService } from './disbursements.service';
import { DisbursementsController } from './disbursements.controller';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Disbursement.name, schema: DisbursementSchema },
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    EmailModule,
  ],
  controllers: [DisbursementsController],
  providers: [DisbursementsService],
  exports: [DisbursementsService],
})
export class DisbursementsModule {}
