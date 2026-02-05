import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailData } from '../common/interfaces';
import { DEFAULT_LANGUAGE, Language, normalizeLanguage } from '../common/i18n/language';

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
      const language = normalizeLanguage(data.language) || DEFAULT_LANGUAGE;
      const html = this.renderTemplate(data.template, data.context, language);

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
    language: Language,
  ): string {
    const templatesEn: Record<string, (ctx: any) => string> = {
      welcome: this.welcomeTemplate,
      'password-reset': this.passwordResetTemplate,
      'user-activation': this.userActivationTemplate,
      'disbursement-pending': this.disbursementPendingTemplate,
      'disbursement-approved': this.disbursementApprovedTemplate,
      'disbursement-rejected': this.disbursementRejectedTemplate,
      'disbursement-completed': this.disbursementCompletedTemplate,
      'kaeyros-intervention': this.kaeyrosInterventionTemplate,
      'account-deactivated': this.accountDeactivatedTemplate,
      'account-reactivated': this.accountReactivatedTemplate,
      'company-deactivated': this.companyDeactivatedTemplate,
      'company-reactivated': this.companyReactivatedTemplate,
      reminder: this.reminderTemplate,
      default: this.defaultTemplate,
    };

    const templatesFr: Record<string, (ctx: any) => string> = {
      welcome: this.welcomeTemplateFr,
      'password-reset': this.passwordResetTemplateFr,
      'user-activation': this.userActivationTemplateFr,
      'disbursement-pending': this.disbursementPendingTemplateFr,
      'disbursement-approved': this.disbursementApprovedTemplateFr,
      'disbursement-rejected': this.disbursementRejectedTemplateFr,
      'disbursement-completed': this.disbursementCompletedTemplateFr,
      'kaeyros-intervention': this.kaeyrosInterventionTemplateFr,
      'account-deactivated': this.accountDeactivatedTemplateFr,
      'account-reactivated': this.accountReactivatedTemplateFr,
      'company-deactivated': this.companyDeactivatedTemplateFr,
      'company-reactivated': this.companyReactivatedTemplateFr,
      reminder: this.reminderTemplateFr,
      default: this.defaultTemplateFr,
    };

    const templates = language === 'fr' ? templatesFr : templatesEn;
    const templateFn = templates[template] || templates.default;
    if (!templateFn) {
      this.logger.warn(`Template ${template} not found, using default`);
      return this.defaultTemplate(context);
    }

    return templateFn.call(this, context);
  }

  private baseTemplate(content: string, context: any, language: Language): string {
    const footerText =
      language === 'fr'
        ? "Ceci est un message automatique. Merci de ne pas repondre."
        : 'This is an automated message. Please do not reply.';

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
            <p>${footerText}</p>
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
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
    return this.baseTemplate(content, context, 'en');
  }

  private accountDeactivatedTemplate(context: any): string {
    const content = `
      <h2>Account Deactivated</h2>
      <p>Hi ${context.firstName},</p>
      <p>Your account has been deactivated by an administrator.</p>
      <p>You will not be able to sign in until your account is reactivated.</p>
      <p>If you think this is a mistake, please contact your company administrator.</p>
    `;
    return this.baseTemplate(content, context, 'en');
  }

  private accountReactivatedTemplate(context: any): string {
    const content = `
      <h2>Account Reactivated</h2>
      <p>Hi ${context.firstName},</p>
      <p>Your account has been reactivated by an administrator.</p>
      <p>You can now sign in again.</p>
      <p>If you have questions, please contact your company administrator.</p>
    `;
    return this.baseTemplate(content, context, 'en');
  }

  private companyDeactivatedTemplate(context: any): string {
    const content = `
      <h2>Company Account Deactivated</h2>
      <p>Hi ${context.firstName},</p>
      <p>Your company account has been deactivated by a platform administrator.</p>
      <p>You will not be able to access the system until the account is reactivated.</p>
      <p>If you believe this is a mistake, please contact support.</p>
    `;
    return this.baseTemplate(content, context, 'en');
  }

  private companyReactivatedTemplate(context: any): string {
    const content = `
      <h2>Company Account Reactivated</h2>
      <p>Hi ${context.firstName},</p>
      <p>Your company account has been reactivated by a platform administrator.</p>
      <p>You can now access the system again.</p>
    `;
    return this.baseTemplate(content, context, 'en');
  }

  private defaultTemplate(context: any): string {
    const content = `
      <h2>${context.title || 'Notification'}</h2>
      <p>${context.message || ''}</p>
    `;
    return this.baseTemplate(content, context, 'en');
  }

  private welcomeTemplateFr(context: any): string {
    const content = `
      <h2>Bienvenue sur K-shap, ${context.firstName}!</h2>
      <p>Votre compte a ete cree avec succes.</p>
      <p>Entreprise: <strong>${context.companyName}</strong></p>
      <p>Email: <strong>${context.email}</strong></p>
      <p>Pour commencer, veuillez definir votre mot de passe en cliquant sur le bouton ci-dessous:</p>
      <p style="text-align: center;">
        <a href="${context.activationUrl}" class="button">Definir le mot de passe</a>
      </p>
      <p>Ce lien expirera dans 24 heures.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private passwordResetTemplateFr(context: any): string {
    const content = `
      <h2>Demande de reinitialisation du mot de passe</h2>
      <p>Bonjour ${context.firstName},</p>
      <p>Nous avons recu une demande de reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer:</p>
      <p style="text-align: center;">
        <a href="${context.resetUrl}" class="button">Reinitialiser le mot de passe</a>
      </p>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private userActivationTemplateFr(context: any): string {
    const content = `
      <h2>Activez votre compte</h2>
      <p>Bonjour ${context.firstName},</p>
      <p>Veuillez cliquer sur le bouton ci-dessous pour activer votre compte et definir votre mot de passe:</p>
      <p style="text-align: center;">
        <a href="${context.activationUrl}" class="button">Activer le compte</a>
      </p>
      <p>Ce lien expirera dans 24 heures.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private disbursementPendingTemplateFr(context: any): string {
    const content = `
      <h2>Decaissement en attente de votre action</h2>
      <p>Bonjour ${context.recipientName},</p>
      <p>Un decaissement requiert votre ${context.actionType}:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Montant:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Beneficiaire:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.beneficiary}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.description}</td></tr>
        <tr><td style="padding: 8px;"><strong>Cree par:</strong></td><td style="padding: 8px;">${context.createdBy}</td></tr>
      </table>
      <p style="text-align: center;">
        <a href="${context.actionUrl}" class="button">Voir le decaissement</a>
      </p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private disbursementApprovedTemplateFr(context: any): string {
    const content = `
      <h2>Decaissement approuve</h2>
      <p>Bonjour ${context.recipientName},</p>
      <p>Le decaissement suivant a ete approuve par ${context.approverRole}:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Montant:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Approuve par:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.approverName}</td></tr>
        <tr><td style="padding: 8px;"><strong>Etape suivante:</strong></td><td style="padding: 8px;">${context.nextStep}</td></tr>
      </table>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private disbursementRejectedTemplateFr(context: any): string {
    const content = `
      <h2>Decaissement rejete</h2>
      <p>Bonjour ${context.recipientName},</p>
      <p>Le decaissement suivant a ete rejete:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Montant:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Rejete par:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.rejectedBy}</td></tr>
        <tr><td style="padding: 8px;"><strong>Raison:</strong></td><td style="padding: 8px;">${context.reason}</td></tr>
      </table>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private disbursementCompletedTemplateFr(context: any): string {
    const content = `
      <h2>Decaissement termine</h2>
      <p>Bonjour ${context.recipientName},</p>
      <p>Le decaissement suivant a ete termine:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Montant:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Beneficiaire:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.beneficiary}</td></tr>
        <tr><td style="padding: 8px;"><strong>Termine le:</strong></td><td style="padding: 8px;">${context.completedAt}</td></tr>
      </table>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private kaeyrosInterventionTemplateFr(context: any): string {
    const content = `
      <h2 style="color: #dc2626;">Notification d'intervention Kaeyros</h2>
      <p>Bonjour ${context.recipientName},</p>
      <p>Nous vous informons que l'equipe support Kaeyros est intervenue sur un decaissement de votre entreprise:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.disbursementRef}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Action:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.action}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Agent support:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.kaeyrosAgent}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Raison:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.reason}</td></tr>
        <tr><td style="padding: 8px;"><strong>Horodatage:</strong></td><td style="padding: 8px;">${context.timestamp}</td></tr>
      </table>
      <p>Si vous avez des questions, veuillez contacter le support Kaeyros.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private reminderTemplateFr(context: any): string {
    const content = `
      <h2>Rappel: decaissement en attente de votre action</h2>
      <p>Bonjour ${context.recipientName},</p>
      <p>Ceci est un rappel: le decaissement suivant est en attente de votre ${context.actionType}:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.referenceNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Montant:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${context.amount} ${context.currency}</td></tr>
        <tr><td style="padding: 8px;"><strong>En attente depuis:</strong></td><td style="padding: 8px;">${context.pendingSince}</td></tr>
      </table>
      <p style="text-align: center;">
        <a href="${context.actionUrl}" class="button">Agir</a>
      </p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private accountDeactivatedTemplateFr(context: any): string {
    const content = `
      <h2>Compte desactive</h2>
      <p>Bonjour ${context.firstName},</p>
      <p>Votre compte a ete desactive par un administrateur.</p>
      <p>Vous ne pourrez pas vous connecter tant que votre compte n'aura pas ete reactive.</p>
      <p>Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private accountReactivatedTemplateFr(context: any): string {
    const content = `
      <h2>Compte reactive</h2>
      <p>Bonjour ${context.firstName},</p>
      <p>Votre compte a ete reactive par un administrateur.</p>
      <p>Vous pouvez a present vous reconnecter.</p>
      <p>Si vous avez des questions, contactez votre administrateur.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private companyDeactivatedTemplateFr(context: any): string {
    const content = `
      <h2>Compte entreprise desactive</h2>
      <p>Bonjour ${context.firstName},</p>
      <p>Le compte de votre entreprise a ete desactive par un administrateur de la plateforme.</p>
      <p>Vous ne pourrez plus acceder au systeme tant que le compte n'aura pas ete reactive.</p>
      <p>Si vous pensez qu'il s'agit d'une erreur, contactez le support.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private companyReactivatedTemplateFr(context: any): string {
    const content = `
      <h2>Compte entreprise reactive</h2>
      <p>Bonjour ${context.firstName},</p>
      <p>Le compte de votre entreprise a ete reactive par un administrateur de la plateforme.</p>
      <p>Vous pouvez a present acceder au systeme.</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }

  private defaultTemplateFr(context: any): string {
    const content = `
      <h2>${context.title || 'Notification'}</h2>
      <p>${context.message || ''}</p>
    `;
    return this.baseTemplate(content, context, 'fr');
  }
}
