import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SubjectOfferingsController } from './subject-offerings.controller';
import { SubjectOfferingsService } from './subject-offerings.service';

/**
 * SubjectOfferingsModule
 *
 * CRUD for the SubjectOffering aggregate (a Subject scheduled in a Term,
 * optionally scoped to a Section). Mirrors SectionsModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SubjectOfferingsController],
  providers: [SubjectOfferingsService],
  exports: [SubjectOfferingsService],
})
export class SubjectOfferingsModule {}
