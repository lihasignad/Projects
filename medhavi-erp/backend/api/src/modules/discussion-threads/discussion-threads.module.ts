import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DiscussionThreadsController } from './discussion-threads.controller';
import { DiscussionThreadsService } from './discussion-threads.service';

/**
 * DiscussionThreadsModule
 *
 * CRUD for the DiscussionThread aggregate (course-scoped Q&A /
 * announcement threads). Mirrors ResourcesModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DiscussionThreadsController],
  providers: [DiscussionThreadsService],
  exports: [DiscussionThreadsService],
})
export class DiscussionThreadsModule {}
