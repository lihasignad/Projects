import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HelpCenterArticlesController } from './help-center-articles.controller';
import { HelpCenterArticlesService } from './help-center-articles.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HelpCenterArticlesController],
  providers: [HelpCenterArticlesService],
  exports: [HelpCenterArticlesService],
})
export class HelpCenterArticlesModule {}
