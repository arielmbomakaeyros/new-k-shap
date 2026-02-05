import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailData } from '../common/interfaces';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpSecureRaw = String(
      this.configService.get('SMTP_SECURE', 'false'),
    ).toLowerCase();
    const smtpSecure =
      smtpSecureRaw === 'true' ||
      smtpSecureRaw === '1' ||
      smtpSecureRaw === 'yes';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: smtpSecure,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async send(data: EmailData): Promise<boolean> {
    try {
      const html = this.renderTemplate(data.template, data.context);

      await this.transporter.sendMail({
        from: `"${this.configService.get('SMTP_FROM_NAME', 'K-shap')}" <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        cc: data.cc?.join(', '),
        bcc: data.bcc?.join(', '),
        subject: data.subject,
        html,
        attachments: data.attachments,
      });

      this.logger.log(`Email sent successfully to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  private renderTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    const templates: Record<string, (ctx: any) => string> = {
      welcome: this.welcomeTemplate,
      'password-reset': this.passwordResetTemplate,
      'user-activation': this.userActivationTemplate,
      'disbursement-pending': this.disbursementPendingTemplate,
      'disbursement-approved': this.disbursementApprovedTemplate,
      'disbursement-rejected': this.disbursementRejectedTemplate,
      'disbursement-completed': this.disbursementCompletedTemplate,
      'kaeyros-intervention': this.kaeyrosInterventionTemplate,
      reminder: this.reminderTemplate,
    };

    const templateFn = templates[template];
    if (!templateFn) {
      this.logger.warn(`Template ${template} not found, using default`);
      return this.defaultTemplate(context);
    }

    return templateFn.call(this, context);
  }

  private baseTemplate(content: string, context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>K-shap</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>K-shap</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>${context.companyName || 'K-shap'}</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private welcomeTemplate(context: any): string {
    const content = `
      <h2>Welcome to K-shap, ${context.firstName}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Company: <strong>${context.companyName}</strong></p>
      <p>Email: <strong>${context.email}</strong></p>
      <p>To get started, please set your password by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${context.activationUrl}" class="button">Set Password</a>
      </p>
      <p>This link will expire in 24 hours.</p>
    `;
    return this.baseTemplate(content, context);
  }

  private passwordResetTemplate(context: any): string {
    const content = `
      <h2>Password Reset Request</h2>
      <p>Hi ${context.firstName},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <p style="text-align: center;">
        <a href="${context.resetUrl}" class="button">Reset Password</a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    return this.baseTemplate(content, context);
  }

  private userActivationTemplate(context: any): string {
    const content = `
      <h2>Activate Your Account</h2>
      <p>Hi ${context.firstName},</p>
      <p>Please click the button below to activate your account and set your password:</p>
      <p style="text-align: center;">
        <a href="${context.activationUrl}" class="button">Activate Account</a>
      </p>
      <p>This link will expire in 24 hours.</p>
    `;
    return this.baseTemplate(content, context);
  }

  private disbursementPendingTemplate(context: any): string {
    const content = `
      <h2>Disbursement Pending Your Action</h2>
      <p>Hi ${context.recipientName},</p>
      <p>A disbursement requires your ${context.actionType}:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Beneficiary:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.beneficiary}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.description}</td></tr>
        <tr><td style="padding: 8px;"><strong>Created by:</strong></td><td style="padding: 8px;">${context.createdBy}</td></tr>
      </table>
      <p style="text-align: center;">
        <a href="${context.actionUrl}" class="button">View Disbursement</a>
      </p>
    `;
    return this.baseTemplate(content, context);
  }

  private disbursementApprovedTemplate(context: any): string {
    const content = `
      <h2>Disbursement Approved</h2>
      <p>Hi ${context.recipientName},</p>
      <p>The following disbursement has been approved by ${context.approverRole}:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Approved by:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.approverName}</td></tr>
        <tr><td style="padding: 8px;"><strong>Next step:</strong></td><td style="padding: 8px;">${context.nextStep}</td></tr>
      </table>
    `;
    return this.baseTemplate(content, context);
  }

  private disbursementRejectedTemplate(context: any): string {
    const content = `
      <h2>Disbursement Rejected</h2>
      <p>Hi ${context.recipientName},</p>
      <p>The following disbursement has been rejected:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Rejected by:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.rejectedBy}</td></tr>
        <tr><td style="padding: 8px;"><strong>Reason:</strong></td><td style="padding: 8px;">${context.reason}</td></tr>
      </table>
    `;
    return this.baseTemplate(content, context);
  }

  private disbursementCompletedTemplate(context: any): string {
    const content = `
      <h2>Disbursement Completed</h2>
      <p>Hi ${context.recipientName},</p>
      <p>The following disbursement has been completed:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Beneficiary:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.beneficiary}</td></tr>
        <tr><td style="padding: 8px;"><strong>Completed at:</strong></td><td style="padding: 8px;">${context.completedAt}</td></tr>
      </table>
    `;
    return this.baseTemplate(content, context);
  }

  private kaeyrosInterventionTemplate(context: any): string {
    const content = `
      <h2 style="color: #dc2626;">Kaeyros Support Intervention Notice</h2>
      <p>Hi ${context.recipientName},</p>
      <p>This is to notify you that Kaeyros support team has intervened on a disbursement in your company:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.disbursementRef}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Action:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.action}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Support Agent:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.kaeyrosAgent}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.reason}</td></tr>
        <tr><td style="padding: 8px;"><strong>Timestamp:</strong></td><td style="padding: 8px;">${context.timestamp}</td></tr>
      </table>
      <p>If you have any questions about this intervention, please contact Kaeyros support.</p>
    `;
    return this.baseTemplate(content, context);
  }

  private reminderTemplate(context: any): string {
    const content = `
      <h2>Reminder: Disbursement Awaiting Your Action</h2>
      <p>Hi ${context.recipientName},</p>
      <p>This is a reminder that the following disbursement is awaiting your ${context.actionType}:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px;"><strong>Pending since:</strong></td><td style="padding: 8px;">${context.pendingSince}</td></tr>
      </table>
      <p style="text-align: center;">
        <a href="${context.actionUrl}" class="button">Take Action</a>
      </p>
    `;
    return this.baseTemplate(content, context);
  }

  private defaultTemplate(context: any): string {
    const content = `
      <h2>${context.title || 'Notification'}</h2>
      <p>${context.message || ''}</p>
    `;
    return this.baseTemplate(content, context);
  }
}
