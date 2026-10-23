import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

export interface NotificationJobData {
  recipientId: string;
  instituteId: string;
  title: string;
  message: string;
  channels: string[];
}

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationJobData, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ID: ${job.id} for recipient: ${job.data.recipientId}`);
    return { success: true, processedAt: new Date().toISOString() };
  }
}
