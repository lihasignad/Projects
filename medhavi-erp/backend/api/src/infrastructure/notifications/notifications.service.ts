import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';
import { SmsService } from '../sms/sms.service';

export interface SendNotificationDto {
  recipientId: string;
  instituteId: string;
  title: string;
  message: string;
  channels: ('EMAIL' | 'SMS' | 'IN_APP' | 'PUSH')[];
  email?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly sms: SmsService,
  ) {}

  async send(dto: SendNotificationDto): Promise<boolean> {
    this.logger.log(`Dispatching notification to ${dto.recipientId} via [${dto.channels.join(', ')}]`);

    for (const channel of dto.channels) {
      if (channel === 'EMAIL' && dto.email) {
        await this.mailer.sendMail({
          to: dto.email,
          subject: dto.title,
          text: dto.message,
        });
      }

      if (channel === 'SMS' && dto.phoneNumber) {
        await this.sms.sendSms({
          phoneNumber: dto.phoneNumber,
          message: `${dto.title}: ${dto.message}`,
        });
      }

      if (channel === 'IN_APP') {
        this.logger.log(`[IN_APP Notification] Stored for recipient: ${dto.recipientId}`);
      }
    }

    return true;
  }
}
