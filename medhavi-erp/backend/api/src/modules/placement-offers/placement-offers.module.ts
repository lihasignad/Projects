import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlacementOffersController } from './placement-offers.controller';
import { PlacementOffersService } from './placement-offers.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlacementOffersController],
  providers: [PlacementOffersService],
  exports: [PlacementOffersService],
})
export class PlacementOffersModule {}
