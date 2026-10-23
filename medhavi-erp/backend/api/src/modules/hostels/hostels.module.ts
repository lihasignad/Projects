import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HostelsController } from './hostels.controller';
import { HostelsService } from './hostels.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HostelsController],
  providers: [HostelsService],
  exports: [HostelsService],
})
export class HostelsModule {}
