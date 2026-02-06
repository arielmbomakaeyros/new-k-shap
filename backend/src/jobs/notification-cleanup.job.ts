import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../database/schemas/notification.schema';

@Injectable()
export class NotificationCleanupJob {
  private readonly logger = new Logger(NotificationCleanupJob.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup() {
    this.logger.log('Starting notification cleanup job...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      const result = await this.notificationModel.updateMany(
        {
          isRead: true,
          isArchived: false,
          createdAt: { $lte: ninetyDaysAgo },
        },
        {
          $set: { isArchived: true },
        },
      );

      this.logger.log(`Notification cleanup completed. Archived: ${result.modifiedCount}`);
    } catch (error) {
      this.logger.error(`Notification cleanup error: ${error.message}`);
    }
  }
}
