import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import {
  InvitationEmailData,
  WelcomeEmailData,
  AccountSuspendedEmailData,
  PermissionsUpdatedEmailData,
  getInvitationEmailHtml,
  getWelcomeEmailHtml,
  getAccountSuspendedEmailHtml,
  getPermissionsUpdatedEmailHtml
} from './templates/emailTemplates';

export class EmailService {
  private transporter: Transporter | null = null;
  private isVerified: boolean = false;

  constructor() {
    this.initTransporter();
  }

  /**
   * Initialize Nodemailer Transporter
   */
  private initTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP.HOST,
        port: env.SMTP.PORT,
        secure: env.SMTP.PORT === 465, // true for 465, false for 587
        auth: {
          user: env.SMTP.USER,
          pass: env.SMTP.PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (err: any) {
      logger.error(`✗ Failed to create Nodemailer transport: ${err?.message || err}`);
      this.transporter = null;
    }
  }

  /**
   * Verify SMTP Transporter Connection on Server Startup
   */
  public async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.initTransporter();
    }
    if (!this.transporter) {
      logger.error('✗ SMTP Transporter is not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      this.isVerified = true;
      logger.info(`✓ SMTP Connected (${env.SMTP.HOST}:${env.SMTP.PORT} as ${env.SMTP.USER})`);
      return true;
    } catch (err: any) {
      this.isVerified = false;
      logger.error(`✗ SMTP Authentication Failed: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Send Staff Invitation Email
   */
  public async sendStaffInvitation(data: InvitationEmailData): Promise<any> {
    if (!this.transporter) {
      this.initTransporter();
    }
    if (!this.transporter) {
      throw new Error('SMTP service unavailable. Check SMTP configuration.');
    }

    const html = getInvitationEmailHtml(data);
    const fromAddress = `"${env.EMAIL.FROM_NAME}" <${env.EMAIL.FROM_ADDRESS}>`;

    logger.info(`📧 Attempting to send staff invitation email to: ${data.email}`);

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: data.email,
        subject: "You're invited to Self Print Admin Portal",
        html,
        text: `Hello ${data.name},\n\nYou have been invited to join Self Print Admin Portal as a ${data.role} in ${data.department}.\n\nActivate your account at: ${data.activationUrl}\n\nThis link is valid for 48 hours.`
      });

      logger.info(`✓ Staff invitation email sent successfully to ${data.email} (MessageID: ${info.messageId})`);
      return info;
    } catch (err: any) {
      logger.error(`✗ Failed to send invitation email to ${data.email}: ${err?.message || err}`);
      throw new Error(`Email delivery failed: ${err?.message || 'SMTP server error'}`);
    }
  }

  /**
   * Send Welcome Email post activation
   */
  public async sendWelcomeEmail(data: WelcomeEmailData): Promise<any> {
    if (!this.transporter) return null;

    try {
      const html = getWelcomeEmailHtml(data);
      return await this.transporter.sendMail({
        from: `"${env.EMAIL.FROM_NAME}" <${env.EMAIL.FROM_ADDRESS}>`,
        to: data.email,
        subject: 'Welcome to Self Print Admin Team',
        html
      });
    } catch (err: any) {
      logger.warn(`Failed to send welcome email to ${data.email}: ${err?.message}`);
      return null;
    }
  }

  /**
   * Send Account Suspended Notification
   */
  public async sendAccountSuspended(data: AccountSuspendedEmailData, email: string): Promise<any> {
    if (!this.transporter) return null;

    try {
      const html = getAccountSuspendedEmailHtml(data);
      return await this.transporter.sendMail({
        from: `"${env.EMAIL.FROM_NAME}" <${env.EMAIL.FROM_ADDRESS}>`,
        to: email,
        subject: 'Important: Account Access Status Update - Self Print',
        html
      });
    } catch (err: any) {
      logger.warn(`Failed to send suspension email to ${email}: ${err?.message}`);
      return null;
    }
  }

  /**
   * Send Permissions Updated Notification
   */
  public async sendPermissionsUpdated(data: PermissionsUpdatedEmailData, email: string): Promise<any> {
    if (!this.transporter) return null;

    try {
      const html = getPermissionsUpdatedEmailHtml(data);
      return await this.transporter.sendMail({
        from: `"${env.EMAIL.FROM_NAME}" <${env.EMAIL.FROM_ADDRESS}>`,
        to: email,
        subject: 'Role & Permissions Updated - Self Print',
        html
      });
    } catch (err: any) {
      logger.warn(`Failed to send permissions updated email to ${email}: ${err?.message}`);
      return null;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
