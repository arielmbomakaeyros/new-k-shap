import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisbursementTemplatesController } from './disbursement-templates.controller';
import { DisbursementTemplatesService } from './disbursement-templates.service';
import { DisbursementTemplate, DisbursementTemplateSchema } from '../../database/schemas/disbursement-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DisbursementTemplate.name, schema: DisbursementTemplateSchema },
    ]),
  ],
  controllers: [DisbursementTemplatesController],
  providers: [DisbursementTemplatesService],
  exports: [DisbursementTemplatesService],
})
export class DisbursementTemplatesModule {}
