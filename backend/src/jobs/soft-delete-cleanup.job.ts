import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Disbursement } from '../database/schemas/disbursement.schema';
import { Collection } from '../database/schemas/collection.schema';
import { User } from '../database/schemas/user.schema';

@Injectable()
export class SoftDeleteCleanupJob {
  private readonly logger = new Logger(SoftDeleteCleanupJob.name);

  constructor(
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanup() {
    this.logger.log('Starting soft-delete cleanup job...');
    const now = new Date();

    const models: { name: string; model: Model<any> }[] = [
      { name: 'Disbursement', model: this.disbursementModel },
      { name: 'Collection', model: this.collectionModel },
      { name: 'User', model: this.userModel },
    ];

    let totalDeleted = 0;

    for (const { name, model } of models) {
      try {
        const result = await model.deleteMany({
          isDeleted: true,
          permanentDeleteScheduledFor: { $lte: now, $ne: null },
        });
        if (result.deletedCount > 0) {
          this.logger.log(`Permanently deleted ${result.deletedCount} ${name} records`);
          totalDeleted += result.deletedCount;
        }
      } catch (error) {
        this.logger.error(`Error cleaning up ${name}: ${error.message}`);
      }
    }

    this.logger.log(`Soft-delete cleanup completed. Total deleted: ${totalDeleted}`);
  }
}
