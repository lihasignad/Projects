import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FeeWaiversController } from './fee-waivers.controller';
import { FeeWaiversService } from './fee-waivers.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FeeWaiversController],
  providers: [FeeWaiversService],
  exports: [FeeWaiversService],
})
export class FeeWaiversModule {}
