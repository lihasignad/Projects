import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AttendanceRecordsController } from './attendance-records.controller';
import { AttendanceRecordsService } from './attendance-records.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AttendanceRecordsController],
  providers: [AttendanceRecordsService],
  exports: [AttendanceRecordsService],
})
export class AttendanceRecordsModule {}
