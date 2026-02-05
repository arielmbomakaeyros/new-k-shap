import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KaeyrosService } from './kaeyros.service';
import { KaeyrosController } from './kaeyros.controller';
import { Company, CompanySchema } from '../../database/schemas/company.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Disbursement, DisbursementSchema } from '../../database/schemas/disbursement.schema';
import { Collection, CollectionSchema } from '../../database/schemas/collection.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';
import { Role, RoleSchema } from '../../database/schemas/role.schema';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
      { name: Disbursement.name, schema: DisbursementSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    UsersModule,
    RolesModule,
  ],
  controllers: [KaeyrosController],
  providers: [KaeyrosService],
  exports: [KaeyrosService],
})
export class KaeyrosModule {}
