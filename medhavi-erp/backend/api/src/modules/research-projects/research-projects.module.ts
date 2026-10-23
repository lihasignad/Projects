import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ResearchProjectsController } from './research-projects.controller';
import { ResearchProjectsService } from './research-projects.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ResearchProjectsController],
  providers: [ResearchProjectsService],
  exports: [ResearchProjectsService],
})
export class ResearchProjectsModule {}
