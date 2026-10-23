import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlacementDrivesController } from './placement-drives.controller';
import { PlacementDrivesService } from './placement-drives.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlacementDrivesController],
  providers: [PlacementDrivesService],
  exports: [PlacementDrivesService],
})
export class PlacementDrivesModule {}
