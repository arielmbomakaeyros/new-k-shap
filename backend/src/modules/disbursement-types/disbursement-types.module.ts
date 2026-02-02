import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisbursementType, DisbursementTypeSchema } from '../../database/schemas/disbursement-type.schema';
import { DisbursementTypesService } from './disbursement-types.service';
import { DisbursementTypesController } from './disbursement-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DisbursementType.name, schema: DisbursementTypeSchema }]),
  ],
  controllers: [DisbursementTypesController],
  providers: [DisbursementTypesService],
  exports: [DisbursementTypesService],
})
export class DisbursementTypesModule {}
