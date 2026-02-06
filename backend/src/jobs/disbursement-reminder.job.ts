import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Disbursement } from '../database/schemas/disbursement.schema';
import { User } from '../database/schemas/user.schema';
import { DisbursementStatus, UserRole } from '../database/schemas/enums';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DisbursementReminderJob {
  private readonly logger = new Logger(DisbursementReminderJob.name);

  constructor(
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  // Weekdays at 9AM
  @Cron('0 9 * * 1-5')
  async handleReminders() {
    this.logger.log('Starting disbursement reminder job...');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const pendingStatuses = [
      DisbursementStatus.PENDING_DEPT_HEAD,
      DisbursementStatus.PENDING_VALIDATOR,
      DisbursementStatus.PENDING_CASHIER,
    ];

    const pendingDisbursements = await this.disbursementModel
      .find({
        status: { $in: pendingStatuses },
        isDeleted: false,
        updatedAt: { $lte: threeDaysAgo },
      })
      .populate('company', 'name defaultLanguage')
      .populate('beneficiary', 'name')
      .lean();

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    let remindersSent = 0;

    for (const disbursement of pendingDisbursements) {
      try {
        const { roleNeeded, actionType } = this.getApproverInfo(disbursement.status);
        const companyId = (disbursement.company as any)?._id || disbursement.company;
        const approvers = await this.userModel
          .find({
            company: new Types.ObjectId(companyId),
            systemRoles: { $in: roleNeeded },
            isActive: true,
            isDeleted: false,
            'notificationPreferences.email': { $ne: false },
          } as any)
          .lean();

        for (const approver of approvers) {
          const language = (approver as any).preferredLanguage || (disbursement.company as any)?.defaultLanguage || 'fr';
          await this.emailService.send({
            to: approver.email,
            subject: language === 'fr'
              ? `Rappel: Décaissement en attente - ${disbursement.referenceNumber}`
              : `Reminder: Pending Disbursement - ${disbursement.referenceNumber}`,
            template: 'reminder',
            context: {
              recipientName: `${approver.firstName} ${approver.lastName}`,
              actionType,
              referenceNumber: disbursement.referenceNumber,
              amount: disbursement.amount.toLocaleString(),
              currency: disbursement.currency,
              pendingSince: disbursement.updatedAt.toLocaleDateString(),
              actionUrl: `${frontendUrl}/disbursements/${disbursement._id}`,
              companyName: (disbursement.company as any)?.name,
            },
            language,
          });
          remindersSent++;
        }
      } catch (error) {
        this.logger.error(`Error sending reminder for ${disbursement.referenceNumber}: ${error.message}`);
      }
    }

    this.logger.log(`Disbursement reminder job completed. Reminders sent: ${remindersSent}`);
  }

  private getApproverInfo(status: DisbursementStatus): { roleNeeded: UserRole[]; actionType: string } {
    switch (status) {
      case DisbursementStatus.PENDING_DEPT_HEAD:
        return { roleNeeded: [UserRole.DEPARTMENT_HEAD], actionType: 'validation' };
      case DisbursementStatus.PENDING_VALIDATOR:
        return { roleNeeded: [UserRole.VALIDATOR], actionType: 'approval' };
      case DisbursementStatus.PENDING_CASHIER:
        return { roleNeeded: [UserRole.CASHIER], actionType: 'execution' };
      default:
        return { roleNeeded: [], actionType: 'action' };
    }
  }
}
