import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDiscussionCommentDto } from './dto/create-discussion-comment.dto';
import { ListDiscussionCommentsQueryDto } from './dto/list-discussion-comments.query';
import { UpdateDiscussionCommentDto } from './dto/update-discussion-comment.dto';

// Re-exported for future audit-log re-integration (mirrors
// discussion-threads / resources / courses services).
export { AuditAction };

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * DiscussionCommentsService
 *
 * CRUD + soft delete for the DiscussionComment aggregate. Audit logging
 * is intentionally omitted in this revision (parity with
 * discussion-threads / resources / courses services); AuditAction is
 * re-exported so a follow-up can re-wire AuditService without touching
 * controllers.
 *
 * Invariants enforced:
 *  - `instituteId`  references a non-deleted Institute.
 *  - `threadId`     references a non-deleted DiscussionThread belonging
 *                   to the same institute.
 *  - `authorUserId` references a non-deleted User belonging to the same
 *                   institute.
 *  - `parentId`     (when provided) references a non-deleted
 *                   DiscussionComment in the SAME thread.
 *  - `editedAt`     is auto-stamped on body mutation (mirrors typical
 *                   forum semantics) when not explicitly provided.
 */
@Injectable()
export class DiscussionCommentsService {
  private readonly logger = new Logger(DiscussionCommentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateDiscussionCommentDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertThreadBelongsToInstitute(
        tx,
        dto.threadId,
        dto.instituteId,
      );
      await this.assertUserBelongsToInstitute(
        tx,
        dto.authorUserId,
        dto.instituteId,
      );
      if (dto.parentId) {
        await this.assertParentInSameThread(tx, dto.parentId, dto.threadId);
      }

      const comment = await tx.discussionComment.create({
        data: {
          instituteId: dto.instituteId,
          threadId: dto.threadId,
          parentId: dto.parentId ?? null,
          authorUserId: dto.authorUserId,
          body: dto.body,
          isAnswer: dto.isAnswer ?? undefined,
          upvotes: dto.upvotes ?? undefined,
          editedAt: dto.editedAt ? new Date(dto.editedAt) : undefined,
        },
      });

      this.logger.log(
        `DiscussionComment created: ${comment.id} (thread=${comment.threadId})`,
      );
      return comment;
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListDiscussionCommentsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.discussionComment.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.DiscussionCommentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.threadId ? { threadId: query.threadId } : {}),
      ...(query.authorUserId ? { authorUserId: query.authorUserId } : {}),
      ...(query.parentId !== undefined
        ? query.parentId === null
          ? { parentId: null }
          : { parentId: query.parentId }
        : {}),
      ...(query.rootOnly ? { parentId: null } : {}),
      ...(query.isAnswer !== undefined ? { isAnswer: query.isAnswer } : {}),
      ...(query.search
        ? { body: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.discussionComment.count({ where }),
      this.prisma.discussionComment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  // --------------------------------------------------------------------------
  // READ — single
  // --------------------------------------------------------------------------
  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const comment = await this.prisma.discussionComment.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!comment) {
      throw new NotFoundException(`DiscussionComment ${id} not found.`);
    }
    return comment;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateDiscussionCommentDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.discussionComment.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`DiscussionComment ${id} not found.`);
      }

      const nextAuthorUserId =
        dto.authorUserId !== undefined
          ? dto.authorUserId
          : existing.authorUserId;
      const nextParentId =
        dto.parentId !== undefined ? dto.parentId : existing.parentId;

      if (
        dto.authorUserId !== undefined &&
        nextAuthorUserId !== existing.authorUserId
      ) {
        await this.assertUserBelongsToInstitute(
          tx,
          nextAuthorUserId,
          existing.instituteId,
        );
      }

      if (dto.parentId !== undefined && nextParentId !== existing.parentId) {
        if (nextParentId === null) {
          // Promoting to a root comment — no parent check needed.
        } else {
          if (nextParentId === existing.id) {
            throw new BadRequestException(
              `DiscussionComment ${id} cannot be its own parent.`,
            );
          }
          await this.assertParentInSameThread(
            tx,
            nextParentId,
            existing.threadId,
          );
        }
      }

      const bodyChanged = dto.body !== undefined && dto.body !== existing.body;

      return tx.discussionComment.update({
        where: { id },
        data: {
          authorUserId: dto.authorUserId ?? undefined,
          parentId:
            dto.parentId === undefined ? undefined : (dto.parentId ?? null),
          body: dto.body ?? undefined,
          isAnswer:
            dto.isAnswer === undefined ? undefined : dto.isAnswer,
          upvotes: dto.upvotes === undefined ? undefined : dto.upvotes,
          editedAt:
            dto.editedAt !== undefined
              ? new Date(dto.editedAt)
              : bodyChanged
                ? new Date()
                : undefined,
        },
      });
    });
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.discussionComment.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.discussionComment.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`DiscussionComment ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate references on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertThreadBelongsToInstitute(
        tx,
        existing.threadId,
        existing.instituteId,
      );
      await this.assertUserBelongsToInstitute(
        tx,
        existing.authorUserId,
        existing.instituteId,
      );
      if (existing.parentId) {
        await this.assertParentInSameThread(
          tx,
          existing.parentId,
          existing.threadId,
        );
      }

      return tx.discussionComment.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private async assertInstituteExists(
    tx: Prisma.TransactionClient,
    instituteId: string,
  ) {
    const institute = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!institute) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertThreadBelongsToInstitute(
    tx: Prisma.TransactionClient,
    threadId: string,
    instituteId: string,
  ) {
    const thread = await tx.discussionThread.findFirst({
      where: { id: threadId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!thread) {
      throw new NotFoundException(`DiscussionThread ${threadId} not found.`);
    }
    if (thread.instituteId !== instituteId) {
      throw new BadRequestException(
        `DiscussionThread ${threadId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertUserBelongsToInstitute(
    tx: Prisma.TransactionClient,
    userId: string,
    instituteId: string,
  ) {
    const user = await tx.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }
    if (user.instituteId !== instituteId) {
      throw new BadRequestException(
        `User ${userId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertParentInSameThread(
    tx: Prisma.TransactionClient,
    parentId: string,
    threadId: string,
  ) {
    const parent = await tx.discussionComment.findFirst({
      where: { id: parentId, deletedAt: null },
      select: { id: true, threadId: true },
    });
    if (!parent) {
      throw new NotFoundException(
        `Parent DiscussionComment ${parentId} not found.`,
      );
    }
    if (parent.threadId !== threadId) {
      throw new BadRequestException(
        `Parent DiscussionComment ${parentId} does not belong to thread ${threadId}.`,
      );
    }
  }
}
