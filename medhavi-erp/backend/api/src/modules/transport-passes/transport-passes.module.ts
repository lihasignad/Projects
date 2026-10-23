import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransportPassesController } from './transport-passes.controller';
import { TransportPassesService } from './transport-passes.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TransportPassesController],
  providers: [TransportPassesService],
  exports: [TransportPassesService],
})
export class TransportPassesModule {}
