import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AttendanceSessionsController } from './attendance-sessions.controller';
import { AttendanceSessionsService } from './attendance-sessions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AttendanceSessionsController],
  providers: [AttendanceSessionsService],
  exports: [AttendanceSessionsService],
})
export class AttendanceSessionsModule {}
