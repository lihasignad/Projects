import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';

/**
 * SchoolsModule
 *
 * CRUD for School entities (academic schools under a Campus, under an Institute).
 * Mirrors CampusesModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and PermissionsGuard.
 *   No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
