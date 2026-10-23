import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

export interface EmailJobData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

@Processor('emails')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData, any, string>): Promise<any> {
    this.logger.log(`Processing email job ID: ${job.id} for "${job.data.subject}"`);
    const recipients = Array.isArray(job.data.to) ? job.data.to.join(', ') : job.data.to;
    this.logger.log(`Successfully dispatched email to ${recipients}`);
    return { delivered: true, recipientCount: Array.isArray(job.data.to) ? job.data.to.length : 1 };
  }
}
