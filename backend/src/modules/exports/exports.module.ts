import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { Export, ExportSchema } from '../../database/schemas/export.schema';
import { Disbursement, DisbursementSchema } from '../../database/schemas/disbursement.schema';
import { Collection, CollectionSchema } from '../../database/schemas/collection.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Export.name, schema: ExportSchema },
      { name: Disbursement.name, schema: DisbursementSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FileUploadModule,
  ],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
