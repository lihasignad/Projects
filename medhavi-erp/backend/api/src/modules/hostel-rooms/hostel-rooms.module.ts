import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HostelRoomsController } from './hostel-rooms.controller';
import { HostelRoomsService } from './hostel-rooms.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HostelRoomsController],
  providers: [HostelRoomsService],
  exports: [HostelRoomsService],
})
export class HostelRoomsModule {}
