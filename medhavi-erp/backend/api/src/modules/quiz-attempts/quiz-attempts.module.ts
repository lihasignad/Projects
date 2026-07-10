import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsService } from './quiz-attempts.service';

/**
 * QuizAttemptsModule
 *
 * CRUD for the QuizAttempt aggregate. Mirrors QuizzesModule:
 *  - Imports PrismaModule for DB access (from infrastructure/prisma).
 *  - Imports AuthModule to consume the exported JwtAuthGuard and
 *    PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuizAttemptsController],
  providers: [QuizAttemptsService],
  exports: [QuizAttemptsService],
})
export class QuizAttemptsModule {}
