import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MailerModule } from '../mailer/mailer.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [MailerModule, SmsModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
