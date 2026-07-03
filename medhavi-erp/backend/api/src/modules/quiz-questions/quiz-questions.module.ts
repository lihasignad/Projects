import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsService } from './quiz-questions.service';

/**
 * QuizQuestionsModule
 *
 * CRUD for the QuizQuestion aggregate. Mirrors QuizBanksModule:
 *  - Imports PrismaModule for DB access (from infrastructure/prisma).
 *  - Imports AuthModule to consume the exported JwtAuthGuard and
 *    PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuizQuestionsController],
  providers: [QuizQuestionsService],
  exports: [QuizQuestionsService],
})
export class QuizQuestionsModule {}
