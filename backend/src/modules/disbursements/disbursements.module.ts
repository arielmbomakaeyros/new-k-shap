import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Disbursement, DisbursementSchema } from '../../database/schemas/disbursement.schema';
import { DisbursementsService } from './disbursements.service';
import { DisbursementsController } from './disbursements.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Disbursement.name, schema: DisbursementSchema }]),
  ],
  controllers: [DisbursementsController],
  providers: [DisbursementsService],
  exports: [DisbursementsService],
})
export class DisbursementsModule {}
