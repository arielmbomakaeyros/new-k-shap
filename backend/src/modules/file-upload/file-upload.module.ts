import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUpload, FileUploadSchema } from '../../database/schemas/file-upload.schema';
import { Company, CompanySchema } from '../../database/schemas/company.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: FileUpload.name, schema: FileUploadSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
