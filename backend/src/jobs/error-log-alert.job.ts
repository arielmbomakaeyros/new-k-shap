import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog } from '../database/schemas/error-log.schema';
import { User } from '../database/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { UserRole } from '../database/schemas/enums';

@Injectable()
export class ErrorLogAlertJob {
  private readonly logger = new Logger(ErrorLogAlertJob.name);

  constructor(
    @InjectModel(ErrorLog.name) private errorLogModel: Model<ErrorLog>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  // Every 15 minutes
  @Cron('*/15 * * * *')
  async handleAlerts() {
    try {
      const unnotifiedErrors = await this.errorLogModel
        .find({
          severity: { $in: ['high', 'critical'] },
          emailSentToKaeyros: false,
          isResolved: false,
        })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      if (unnotifiedErrors.length === 0) return;

      // Find Kaeyros admin users
      const kaeyrosAdmins = await this.userModel
        .find({
          isKaeyrosUser: true,
          systemRoles: { $in: [UserRole.KAEYROS_SUPER_ADMIN, UserRole.KAEYROS_ADMIN] },
          isActive: true,
          isDeleted: false,
        })
        .select('email firstName lastName')
        .lean();

      if (kaeyrosAdmins.length === 0) {
        this.logger.warn('No Kaeyros admins found for error alerts');
        return;
      }

      const errorSummary = unnotifiedErrors
        .map((e) => `[${e.severity.toUpperCase()}] ${e.errorType}: ${e.message} (x${e.occurrenceCount})`)
        .join('\n');

      const adminEmails = kaeyrosAdmins.map((a) => a.email);

      await this.emailService.send({
        to: adminEmails,
        subject: `K-shap Alert: ${unnotifiedErrors.length} unresolved error(s) requiring attention`,
        template: 'default',
        context: {
          title: 'Error Log Alert',
          message: `
            <p>${unnotifiedErrors.length} high/critical error(s) detected:</p>
            <pre style="background:#f3f4f6;padding:12px;border-radius:4px;font-size:13px;overflow-x:auto;">${errorSummary}</pre>
            <p>Please review the error logs in the admin dashboard.</p>
          `,
        },
        language: 'en',
      });

      // Mark as notified
      const errorIds = unnotifiedErrors.map((e) => e._id);
      await this.errorLogModel.updateMany(
        { _id: { $in: errorIds } },
        { $set: { emailSentToKaeyros: true, emailSentAt: new Date() } },
      );

      this.logger.log(`Error alert sent to ${adminEmails.length} admins for ${unnotifiedErrors.length} errors`);
    } catch (error) {
      this.logger.error(`Error log alert job failed: ${error.message}`);
    }
  }
}
