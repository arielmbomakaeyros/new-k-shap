import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUpload, FileUploadSchema } from '../../database/schemas/file-upload.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: FileUpload.name, schema: FileUploadSchema }]),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
