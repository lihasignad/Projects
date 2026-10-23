import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransportStopsController } from './transport-stops.controller';
import { TransportStopsService } from './transport-stops.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TransportStopsController],
  providers: [TransportStopsService],
  exports: [TransportStopsService],
})
export class TransportStopsModule {}
