import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlacementApplicationsController } from './placement-applications.controller';
import { PlacementApplicationsService } from './placement-applications.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlacementApplicationsController],
  providers: [PlacementApplicationsService],
  exports: [PlacementApplicationsService],
})
export class PlacementApplicationsModule {}
