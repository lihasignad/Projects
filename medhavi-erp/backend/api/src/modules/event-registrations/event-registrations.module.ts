import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EventRegistrationsController } from './event-registrations.controller';
import { EventRegistrationsService } from './event-registrations.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EventRegistrationsController],
  providers: [EventRegistrationsService],
  exports: [EventRegistrationsService],
})
export class EventRegistrationsModule {}
