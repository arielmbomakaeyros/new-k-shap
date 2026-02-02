// ==================== src/email/email.service.ts ====================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email service connection failed', error);
      } else {
        this.logger.log('Email service ready');
      }
    });
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    const templateFiles = [
      'activation',
      'password-reset',
      'welcome',
      'disbursement-created',
      'disbursement-validated',
      'disbursement-approved',
      'disbursement-executed',
      'disbursement-rejected',
      'disbursement-completed',
      'critical-error',
      'kaeyros-intervention',
      'company-welcome',
    ];

    templateFiles.forEach(name => {
      try {
        const templatePath = path.join(templatesDir, `${name}.hbs`);
        if (fs.existsSync(templatePath)) {
          const templateSource = fs.readFileSync(templatePath, 'utf-8');
          this.templates.set(name, handlebars.compile(templateSource));
        }
      } catch (error) {
        this.logger.warn(`Failed to load template: ${name}`, error);
      }
    });
  }

  // ==================== ACTIVATION EMAIL ====================
  
  async sendActivationEmail(to: string, activationLink: string, tempPassword?: string) {
    try {
      const template = this.templates.get('activation');
      const html = template ? template({
        activationLink,
        tempPassword,
        appName: this.configService.get('APP_NAME', 'K-shap'),
      }) : this.getDefaultActivationHtml(activationLink, tempPassword);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to,
        subject: 'Activate Your Account - K-shap',
        html,
      });

      this.logger.log(`Activation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${to}`, error);
      throw error;
    }
  }

  // ==================== PASSWORD RESET EMAIL ====================
  
  async sendPasswordResetEmail(to: string, resetToken: string) {
    try {
      const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      const template = this.templates.get('password-reset');
      const html = template ? template({
        resetLink,
        appName: this.configService.get('APP_NAME', 'K-shap'),
      }) : this.getDefaultPasswordResetHtml(resetLink);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to,
        subject: 'Reset Your Password - K-shap',
        html,
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }

  // ==================== COMPANY WELCOME EMAIL ====================
  
  async sendCompanyWelcomeEmail(
    to: string,
    companyName: string,
    activationLink: string,
    tempPassword: string,
  ) {
    try {
      const template = this.templates.get('company-welcome');
      const html = template ? template({
        companyName,
        activationLink,
        tempPassword,
        supportEmail: this.configService.get('KAEYROS_ADMIN_EMAILS').split(',')[0],
      }) : this.getDefaultCompanyWelcomeHtml(companyName, activationLink, tempPassword);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to,
        subject: `Welcome to K-shap - ${companyName}`,
        html,
      });

      this.logger.log(`Company welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send company welcome email to ${to}`, error);
      throw error;
    }
  }

  // ==================== DISBURSEMENT NOTIFICATIONS ====================
  
  async sendDisbursementCreatedEmail(to: string[], disbursement: any) {
    try {
      const template = this.templates.get('disbursement-created');
      const html = template ? template({
        disbursementRef: disbursement.referenceNumber,
        amount: disbursement.amount,
        currency: disbursement.currency,
        beneficiary: disbursement.beneficiary?.name,
        description: disbursement.description,
        createdBy: disbursement.createdBy,
        dashboardLink: `${this.configService.get('FRONTEND_URL')}/disbursements/${disbursement._id}`,
      }) : this.getDefaultDisbursementHtml('created', disbursement);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: to.join(', '),
        subject: `New Disbursement Pending Validation - ${disbursement.referenceNumber}`,
        html,
      });

      this.logger.log(`Disbursement created email sent to ${to.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send disbursement created email', error);
    }
  }

  async sendDisbursementValidatedEmail(to: string[], disbursement: any, validatedBy: any) {
    try {
      const template = this.templates.get('disbursement-validated');
      const html = template ? template({
        disbursementRef: disbursement.referenceNumber,
        validatedBy: `${validatedBy.firstName} ${validatedBy.lastName}`,
        dashboardLink: `${this.configService.get('FRONTEND_URL')}/disbursements/${disbursement._id}`,
      }) : this.getDefaultDisbursementHtml('validated', disbursement);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: to.join(', '),
        subject: `Disbursement Validated - ${disbursement.referenceNumber}`,
        html,
      });

      this.logger.log(`Disbursement validated email sent`);
    } catch (error) {
      this.logger.error('Failed to send disbursement validated email', error);
    }
  }

  async sendDisbursementApprovedEmail(to: string[], disbursement: any, approvedBy: any) {
    try {
      const template = this.templates.get('disbursement-approved');
      const html = template ? template({
        disbursementRef: disbursement.referenceNumber,
        approvedBy: `${approvedBy.firstName} ${approvedBy.lastName}`,
        dashboardLink: `${this.configService.get('FRONTEND_URL')}/disbursements/${disbursement._id}`,
      }) : this.getDefaultDisbursementHtml('approved', disbursement);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: to.join(', '),
        subject: `Disbursement Approved - ${disbursement.referenceNumber}`,
        html,
      });

      this.logger.log(`Disbursement approved email sent`);
    } catch (error) {
      this.logger.error('Failed to send disbursement approved email', error);
    }
  }

  async sendDisbursementExecutedEmail(to: string[], disbursement: any, executedBy: any) {
    try {
      const template = this.templates.get('disbursement-executed');
      const html = template ? template({
        disbursementRef: disbursement.referenceNumber,
        amount: disbursement.amount,
        currency: disbursement.currency,
        executedBy: `${executedBy.firstName} ${executedBy.lastName}`,
        dashboardLink: `${this.configService.get('FRONTEND_URL')}/disbursements/${disbursement._id}`,
      }) : this.getDefaultDisbursementHtml('executed', disbursement);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: to.join(', '),
        subject: `Disbursement Executed - ${disbursement.referenceNumber}`,
        html,
      });

      this.logger.log(`Disbursement executed email sent`);
    } catch (error) {
      this.logger.error('Failed to send disbursement executed email', error);
    }
  }

  async sendDisbursementRejectedEmail(to: string[], disbursement: any, rejectedBy: any, reason: string) {
    try {
      const template = this.templates.get('disbursement-rejected');
      const html = template ? template({
        disbursementRef: disbursement.referenceNumber,
        rejectedBy: `${rejectedBy.firstName} ${rejectedBy.lastName}`,
        reason,
        dashboardLink: `${this.configService.get('FRONTEND_URL')}/disbursements/${disbursement._id}`,
      }) : this.getDefaultDisbursementHtml('rejected', disbursement);

      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: to.join(', '),
        subject: `Disbursement Rejected - ${disbursement.referenceNumber}`,
        html,
      });

      this.logger.log(`Disbursement rejected email sent`);
    } catch (error) {
      this.logger.error('Failed to send disbursement rejected email', error);
    }
  }

  // ==================== CRITICAL ERROR EMAIL (TO KAEYROS) ====================
  
  async sendCriticalErrorAlert(data: {
    to: string[];
    error: string;
    stackTrace?: string;
    context?: string;
    metadata?: any;
    timestamp: string;
  }) {
    try {
      const template = this.templates.get('critical-error');
      const html = template ? template(data) : this.getDefaultCriticalErrorHtml(data);

      await this.transporter.sendMail({
        from: `K-shap Alerts <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to: data.to.join(', '),
        subject: `🚨 CRITICAL ERROR - K-shap Application`,
        html,
        priority: 'high',
      });

      this.logger.log('Critical error alert sent to Kaeyros team');
    } catch (error) {
      this.logger.error('Failed to send critical error alert', error);
      // Don't throw - we don't want email failure to crash the app
    }
  }

  // ==================== KAEYROS INTERVENTION NOTIFICATION ====================
  
  async sendKaeyrosInterventionNotification(
    to: string,
    companyName: string,
    disbursementRef: string,
    action: string,
    kaeyrosAgent: string,
    reason: string,
  ) {
    try {
      const template = this.templates.get('kaeyros-intervention');
      const html = template ? template({
        companyName,
        disbursementRef,
        action,
        kaeyrosAgent,
        reason,
        dashboardLink: this.configService.get('FRONTEND_URL'),
      }) : this.getDefaultKaeyrosInterventionHtml(companyName, disbursementRef, action, reason);

      await this.transporter.sendMail({
        from: `K-shap Support <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to,
        subject: `Kaeyros Support Intervention - ${disbursementRef}`,
        html,
      });

      this.logger.log(`Kaeyros intervention notification sent to ${to}`);
    } catch (error) {
      this.logger.error('Failed to send Kaeyros intervention notification', error);
    }
  }

  // ==================== COMPANY STATUS NOTIFICATION ====================
  
  async sendCompanyStatusNotification(to: string, action: string, reason?: string) {
    try {
      await this.transporter.sendMail({
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
        to,
        subject: `Company Account ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        html: `
          <h2>Company Account ${action.charAt(0).toUpperCase() + action.slice(1)}</h2>
          <p>Your company account has been ${action}.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you have any questions, please contact support.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send company status notification', error);
    }
  }

  // ==================== DEFAULT HTML TEMPLATES (FALLBACK) ====================
  
  private getDefaultActivationHtml(activationLink: string, tempPassword?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          .code { 
            background-color: #f3f4f6; 
            padding: 10px; 
            border-radius: 4px; 
            font-family: monospace;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to K-shap!</h2>
          <p>Your account has been created. Please activate it by clicking the button below:</p>
          <a href="${activationLink}" class="button">Activate Account</a>
          ${tempPassword ? `
            <p>Your temporary password is:</p>
            <div class="code">${tempPassword}</div>
            <p><strong>Note:</strong> You will be required to change this password after activation.</p>
          ` : ''}
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${activationLink}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultPasswordResetHtml(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Link: ${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultCompanyWelcomeHtml(companyName: string, activationLink: string, tempPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to K-shap, ${companyName}!</h2>
          <p>Your company account has been created successfully. As the company super administrator, you have full control over your company's K-shap instance.</p>
          <h3>Activate Your Account</h3>
          <a href="${activationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Activate Account
          </a>
          <p>Your temporary password: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          <p><strong>Important:</strong> You will be required to set a new password upon activation.</p>
          <h3>Next Steps</h3>
          <ol>
            <li>Activate your account using the link above</li>
            <li>Set your new password</li>
            <li>Create departments and offices</li>
            <li>Add users to your company</li>
            <li>Configure your disbursement workflow</li>
          </ol>
          <p>If you need any assistance, our support team is here to help!</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultDisbursementHtml(action: string, disbursement: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Disbursement ${action.charAt(0).toUpperCase() + action.slice(1)}</h2>
          <p><strong>Reference:</strong> ${disbursement.referenceNumber}</p>
          <p><strong>Amount:</strong> ${disbursement.amount} ${disbursement.currency}</p>
          <p><strong>Description:</strong> ${disbursement.description}</p>
          <a href="${this.configService.get('FRONTEND_URL')}/disbursements/${disbursement._id}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Disbursement
          </a>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultCriticalErrorHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 800px; margin: 0 auto; padding: 20px; background-color: #fee; border: 2px solid #f00;">
          <h2 style="color: #f00;">🚨 CRITICAL ERROR</h2>
          <p><strong>Timestamp:</strong> ${data.timestamp}</p>
          <p><strong>Error:</strong> ${data.error}</p>
          ${data.context ? `<p><strong>Context:</strong> ${data.context}</p>` : ''}
          ${data.stackTrace ? `<pre style="background: #f9f9f9; padding: 10px; overflow-x: auto;">${data.stackTrace}</pre>` : ''}
          ${data.metadata ? `<pre style="background: #f9f9f9; padding: 10px; overflow-x: auto;">${JSON.stringify(data.metadata, null, 2)}</pre>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultKaeyrosInterventionHtml(
    companyName: string,
    disbursementRef: string,
    action: string,
    reason: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Kaeyros Support Intervention Notice</h2>
          <p>Dear ${companyName},</p>
          <p>Our support team has intervened on one of your disbursements to assist you.</p>
          <p><strong>Disbursement:</strong> ${disbursementRef}</p>
          <p><strong>Action Taken:</strong> ${action}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>This intervention has been logged in your audit trail for transparency.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `;
  }
}