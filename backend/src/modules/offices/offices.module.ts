import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Office, OfficeSchema } from '../../database/schemas/office.schema';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Office.name, schema: OfficeSchema }]),
  ],
  controllers: [OfficesController],
  providers: [OfficesService],
  exports: [OfficesService],
})
export class OfficesModule {}
