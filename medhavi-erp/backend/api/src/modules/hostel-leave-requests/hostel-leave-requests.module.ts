import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HostelLeaveRequestsController } from './hostel-leave-requests.controller';
import { HostelLeaveRequestsService } from './hostel-leave-requests.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HostelLeaveRequestsController],
  providers: [HostelLeaveRequestsService],
  exports: [HostelLeaveRequestsService],
})
export class HostelLeaveRequestsModule {}
