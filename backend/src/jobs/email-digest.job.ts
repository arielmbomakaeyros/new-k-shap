import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from '../database/schemas/company.schema';
import { Disbursement } from '../database/schemas/disbursement.schema';
import { Collection } from '../database/schemas/collection.schema';
import { User } from '../database/schemas/user.schema';
import { DisbursementStatus, UserRole } from '../database/schemas/enums';
import { EmailService } from '../email/email.service';

@Injectable()
export class EmailDigestJob {
  private readonly logger = new Logger(EmailDigestJob.name);

  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  // Weekdays at 8AM
  @Cron('0 8 * * 1-5')
  async handleDigest() {
    this.logger.log('Starting email digest job...');

    const companies = await this.companyModel
      .find({
        'emailNotificationSettings.dailySummary': true,
        isActive: true,
        isDeleted: false,
      })
      .lean();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let digestsSent = 0;

    for (const company of companies) {
      try {
        const companyId = new Types.ObjectId(company._id as any);
        const [disbursementStats, collectionStats, pendingCount] = await Promise.all([
          this.disbursementModel.aggregate([
            {
              $match: {
                company: companyId,
                isDeleted: false,
                updatedAt: { $gte: yesterday, $lt: today },
              },
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
          ]),
          this.collectionModel.aggregate([
            {
              $match: {
                company: companyId,
                isDeleted: false,
                createdAt: { $gte: yesterday, $lt: today },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
          ]),
          this.disbursementModel.countDocuments({
            company: companyId,
            isDeleted: false,
            status: {
              $in: [
                DisbursementStatus.PENDING_DEPT_HEAD,
                DisbursementStatus.PENDING_VALIDATOR,
                DisbursementStatus.PENDING_CASHIER,
              ],
            },
          } as any),
        ]);

        const completedDisb = disbursementStats.find((s) => s._id === DisbursementStatus.COMPLETED);
        const newDisb = disbursementStats.reduce((acc, s) => acc + s.count, 0);
        const newColl = collectionStats[0]?.count || 0;

        const language = company.defaultLanguage || 'fr';
        const currency = company.defaultCurrency || 'XAF';

        const summaryHtml = language === 'fr'
          ? `
            <h2>Résumé quotidien - ${company.name}</h2>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Décaissements traités hier:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${newDisb}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Décaissements complétés:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${completedDisb?.count || 0} (${(completedDisb?.totalAmount || 0).toLocaleString()} ${currency})</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Encaissements reçus:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${newColl} (${(collectionStats[0]?.totalAmount || 0).toLocaleString()} ${currency})</td></tr>
              <tr><td style="padding:8px;"><strong>Décaissements en attente:</strong></td><td style="padding:8px;">${pendingCount}</td></tr>
            </table>
          `
          : `
            <h2>Daily Summary - ${company.name}</h2>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Disbursements processed yesterday:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${newDisb}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Disbursements completed:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${completedDisb?.count || 0} (${(completedDisb?.totalAmount || 0).toLocaleString()} ${currency})</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Collections received:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${newColl} (${(collectionStats[0]?.totalAmount || 0).toLocaleString()} ${currency})</td></tr>
              <tr><td style="padding:8px;"><strong>Pending disbursements:</strong></td><td style="padding:8px;">${pendingCount}</td></tr>
            </table>
          `;

        // Send to company admins
        const admins = await this.userModel
          .find({
            company: companyId,
            systemRoles: { $in: [UserRole.COMPANY_SUPER_ADMIN] },
            isActive: true,
            isDeleted: false,
          } as any)
          .select('email firstName')
          .lean();

        for (const admin of admins) {
          await this.emailService.send({
            to: admin.email,
            subject: language === 'fr'
              ? `Résumé quotidien - ${company.name}`
              : `Daily Summary - ${company.name}`,
            template: 'default',
            context: {
              title: language === 'fr' ? 'Résumé quotidien' : 'Daily Summary',
              message: summaryHtml,
              companyName: company.name,
            },
            language,
          });
          digestsSent++;
        }
      } catch (error) {
        this.logger.error(`Error sending digest for company ${company.name}: ${error.message}`);
      }
    }

    this.logger.log(`Email digest job completed. Digests sent: ${digestsSent}`);
  }
}
