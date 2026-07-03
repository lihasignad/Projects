import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

/**
 * AssignmentsModule
 *
 * CRUD for the Assignment aggregate. Mirrors AssignmentCategoriesModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
