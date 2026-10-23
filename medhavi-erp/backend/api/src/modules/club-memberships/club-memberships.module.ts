import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ClubMembershipsController } from './club-memberships.controller';
import { ClubMembershipsService } from './club-memberships.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClubMembershipsController],
  providers: [ClubMembershipsService],
  exports: [ClubMembershipsService],
})
export class ClubMembershipsModule {}
