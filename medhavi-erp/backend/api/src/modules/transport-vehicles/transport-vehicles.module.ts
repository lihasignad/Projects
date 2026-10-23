import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransportVehiclesController } from './transport-vehicles.controller';
import { TransportVehiclesService } from './transport-vehicles.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TransportVehiclesController],
  providers: [TransportVehiclesService],
  exports: [TransportVehiclesService],
})
export class TransportVehiclesModule {}
