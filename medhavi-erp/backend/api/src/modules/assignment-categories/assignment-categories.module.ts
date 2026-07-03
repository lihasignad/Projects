import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AssignmentCategoriesController } from './assignment-categories.controller';
import { AssignmentCategoriesService } from './assignment-categories.service';

/**
 * AssignmentCategoriesModule
 *
 * CRUD for the AssignmentCategory aggregate (grading categories such as
 * "Homework", "Quizzes", "Final Exam" scoped to either a Course or a
 * SubjectOffering). Mirrors LmsSessionsModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AssignmentCategoriesController],
  providers: [AssignmentCategoriesService],
  exports: [AssignmentCategoriesService],
})
export class AssignmentCategoriesModule {}
