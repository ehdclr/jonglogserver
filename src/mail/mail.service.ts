import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService, // MailerService 주입
    private readonly configService: ConfigService,
  ) {}

  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    const result = await this.mailerService.sendMail({
      to,
      subject,
      html,
      from: this.configService.get('EMAIL_FROM'), // 필요시 from도 명시
    });

    if (result.accepted.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
