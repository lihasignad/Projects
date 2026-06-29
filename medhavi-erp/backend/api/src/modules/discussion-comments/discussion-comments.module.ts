import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DiscussionCommentsController } from './discussion-comments.controller';
import { DiscussionCommentsService } from './discussion-comments.service';

/**
 * DiscussionCommentsModule
 *
 * CRUD for the DiscussionComment aggregate (replies inside a
 * DiscussionThread, optionally nested under a parent comment).
 * Mirrors DiscussionThreadsModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DiscussionCommentsController],
  providers: [DiscussionCommentsService],
  exports: [DiscussionCommentsService],
})
export class DiscussionCommentsModule {}
