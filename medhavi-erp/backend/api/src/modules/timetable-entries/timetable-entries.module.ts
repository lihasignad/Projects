import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TimetableEntriesController } from './timetable-entries.controller';
import { TimetableEntriesService } from './timetable-entries.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TimetableEntriesController],
  providers: [TimetableEntriesService],
  exports: [TimetableEntriesService],
})
export class TimetableEntriesModule {}
