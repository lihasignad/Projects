import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

/**
 * QuizzesModule
 *
 * CRUD for the Quiz aggregate. Mirrors QuizQuestionsModule:
 *  - Imports PrismaModule for DB access (from infrastructure/prisma).
 *  - Imports AuthModule to consume the exported JwtAuthGuard and
 *    PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
