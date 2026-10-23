import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HostelAllocationsController } from './hostel-allocations.controller';
import { HostelAllocationsService } from './hostel-allocations.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HostelAllocationsController],
  providers: [HostelAllocationsService],
  exports: [HostelAllocationsService],
})
export class HostelAllocationsModule {}
