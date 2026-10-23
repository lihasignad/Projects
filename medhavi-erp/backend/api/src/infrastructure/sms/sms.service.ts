import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsOptions {
  phoneNumber: string;
  message: string;
  templateId?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendSms(options: SmsOptions): Promise<boolean> {
    this.logger.log(`[SMS Dispatched] To: ${options.phoneNumber} | Message: "${options.message}"`);
    return true;
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your Medhavi ERP verification code is: ${otp}. Valid for 5 minutes.`;
    return this.sendSms({ phoneNumber, message });
  }
}
