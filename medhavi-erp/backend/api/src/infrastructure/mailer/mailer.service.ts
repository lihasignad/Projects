import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly fromDefault: string;

  constructor(private readonly config: ConfigService) {
    this.fromDefault = this.config.get<string>('MAIL_FROM', 'no-reply@medhavi.local');
  }

  async sendMail(options: EmailOptions): Promise<boolean> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const from = options.from || this.fromDefault;

    // Log the email delivery (ready for integration with Nodemailer / SendGrid / SES)
    this.logger.log(`[Email Dispatched] To: ${recipients} | Subject: "${options.subject}" | From: ${from}`);
    return true;
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    return this.sendMail({
      to,
      subject: 'Medhavi ERP - Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You recently requested to reset your password for your Medhavi ERP account.</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
          </p>
          <p>If you did not request this, please ignore this email. This link is valid for 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6b7280;">Medhavi Higher Education ERP &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
      text: `Reset your password at: ${resetUrl}`,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: 'Welcome to Medhavi ERP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome, ${name}!</h2>
          <p>Your account on Medhavi ERP has been successfully created.</p>
          <p>You can now sign in using your institutional email address.</p>
        </div>
      `,
      text: `Welcome ${name}! Your account has been created on Medhavi ERP.`,
    });
  }
}
