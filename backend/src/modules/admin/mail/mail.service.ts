import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from 'src/config/mail.config';
import { getOtpTemplate } from './templates/otp.template';
import { getPasswordResetTemplate } from './templates/reset-password.template';
import { getOrderConfirmationTemplate } from './templates/order-confirmation.template';
import { getPaymentOtpTemplate } from './templates/payment-otp.template';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const mail = this.configService.get<MailConfig>('mail');

    if (mail?.host && mail?.user && mail?.pass) {
      this.transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        auth: {
          user: mail.user,
          pass: mail.pass,
        },
      });
    }
  }

  onModuleInit() {
    if (!this.transporter) {
      console.log('Mail is not configured (MAIL_HOST/MAIL_USER/MAIL_PASS) — skipping SMTP.');
      return;
    }
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection failed:', error);
      } else {
        console.log('SMTP is ready to send emails');
      }
    });
  }

  private async deliver(options: nodemailer.SendMailOptions) {
    if (!this.transporter) {
      console.warn(`Mail is disabled — skipped email "${String(options.subject)}" to ${String(options.to)}`);
      return null;
    }
    return this.transporter.sendMail(options);
  }

  async sendOtpEmail(to: string, otp: string) {
    const mail = this.configService.get<MailConfig>('mail');

    if (!to) {
      throw new Error('Recipient email is required');
    }

    const htmlContent = getOtpTemplate(otp);

    return this.deliver({
      from: `"Prime Nuts USA" <${mail.from}>`,
      to,
      subject: '[Prime Nuts USA] Your Verification Code',
      html: htmlContent,
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const mail = this.configService.get<MailConfig>('mail');
    return this.deliver({
      from: `"Prime Nuts USA" <${mail.from}>`,
      to,
      subject: '[Prime Nuts USA] Password Reset Request',
      html: getPasswordResetTemplate(resetLink),
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
  }) {
    const mail = this.configService.get<MailConfig>('mail');

    return this.deliver({
      from: `"Prime Nuts USA" <${mail.from}>`,
      ...options,
    });
  }

  async sendPaymentOtpEmail(to: string, otp: string) {
    const mail = this.configService.get<MailConfig>('mail');
    return this.deliver({
      from: `"Prime Nuts USA" <${mail.from}>`,
      to,
      subject: '[Prime Nuts USA] Mã xác nhận thanh toán',
      html: getPaymentOtpTemplate(otp),
    });
  }

  async sendOrderConfirmationEmail(to: string, order: Parameters<typeof getOrderConfirmationTemplate>[0]) {
    const mail = this.configService.get<MailConfig>('mail');
    return this.deliver({
      from: `"Prime Nuts USA" <${mail.from}>`,
      to,
      subject: `[Prime Nuts USA] Đặt hàng thành công - Mã đơn ${order.order_code}`,
      html: getOrderConfirmationTemplate(order),
    });
  }
}