import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuizBanksController } from './quiz-banks.controller';
import { QuizBanksService } from './quiz-banks.service';

/**
 * QuizBanksModule
 *
 * CRUD for the QuizBank aggregate (a container of QuizQuestions scoped to
 * either a Course or a Subject, owned by a Faculty). Mirrors
 * AssignmentCategoriesModule:
 *  - Imports PrismaModule for DB access (from infrastructure/prisma).
 *  - Imports AuthModule to consume the exported JwtAuthGuard and
 *    PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuizBanksController],
  providers: [QuizBanksService],
  exports: [QuizBanksService],
})
export class QuizBanksModule {}
