import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';

/**
 * ProgramsModule
 *
 * CRUD for Program entities (academic programs under a Department, under a
 * School, optionally under a Campus, under an Institute). Mirrors
 * DepartmentsModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
