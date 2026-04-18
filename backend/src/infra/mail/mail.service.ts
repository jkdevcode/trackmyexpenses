import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return [
      this.configService.get<string>('EMAIL_HOST'),
      this.configService.get<string>('EMAIL_USER'),
      this.configService.get<string>('EMAIL_PASS'),
      this.configService.get<string>('EMAIL_FROM'),
    ].every((value) => typeof value === 'string' && value.trim().length > 0);
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn(
        'SMTP email transport is not configured; skipping email delivery.',
      );
      return false;
    }

    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: this.configService.getOrThrow<string>('EMAIL_FROM'),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return true;
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const port = this.configService.get<number>('EMAIL_PORT', 587);

    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('EMAIL_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.configService.getOrThrow<string>('EMAIL_USER'),
        pass: this.configService.getOrThrow<string>('EMAIL_PASS'),
      },
    });

    return this.transporter;
  }
}
