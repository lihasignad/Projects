import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

export interface AuditJobData {
  instituteId: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

@Processor('audit-ingest')
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  async process(job: Job<AuditJobData, any, string>): Promise<any> {
    this.logger.log(`Ingesting audit event: ${job.data.action} on ${job.data.resource} by ${job.data.userId || 'system'}`);
    return { ingested: true };
  }
}
