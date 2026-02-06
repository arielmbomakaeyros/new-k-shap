import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Disbursement, DisbursementSchema } from '../../database/schemas/disbursement.schema';
import { Collection, CollectionSchema } from '../../database/schemas/collection.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Department, DepartmentSchema } from '../../database/schemas/department.schema';
import { Company, CompanySchema } from '../../database/schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Disbursement.name, schema: DisbursementSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
