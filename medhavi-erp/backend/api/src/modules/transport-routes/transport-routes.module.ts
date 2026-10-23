import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransportRoutesController } from './transport-routes.controller';
import { TransportRoutesService } from './transport-routes.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TransportRoutesController],
  providers: [TransportRoutesService],
  exports: [TransportRoutesService],
})
export class TransportRoutesModule {}
