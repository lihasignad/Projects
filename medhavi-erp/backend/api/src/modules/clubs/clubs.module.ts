import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
