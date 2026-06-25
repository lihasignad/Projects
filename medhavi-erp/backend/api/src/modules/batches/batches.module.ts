import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

/**
 * BatchesModule
 *
 * CRUD for Batch entities (admission cohorts under a Program, anchored to an
 * AcademicYear, within an Institute). Mirrors ProgramsModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
