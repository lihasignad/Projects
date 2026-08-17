import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TimeSlotsController } from './time-slots.controller';
import { TimeSlotsService } from './time-slots.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
