import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDiscussionThreadDto } from './dto/create-discussion-thread.dto';
import { ListDiscussionThreadsQueryDto } from './dto/list-discussion-threads.query';
import { UpdateDiscussionThreadDto } from './dto/update-discussion-thread.dto';

// Re-exported for future audit-log re-integration (mirrors resources /
// courses services).
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
 * DiscussionThreadsService
 *
 * CRUD + soft delete for the DiscussionThread aggregate. Audit logging is
 * intentionally omitted in this revision (parity with resources /
 * courses services); AuditAction is re-exported so a follow-up can
 * re-wire AuditService without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId`  references a non-deleted Institute.
 *  - `courseId`     references a non-deleted Course belonging to the same
 *                   institute.
 *  - `authorUserId` references a non-deleted User belonging to the same
 *                   institute.
 */
@Injectable()
export class DiscussionThreadsService {
  private readonly logger = new Logger(DiscussionThreadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateDiscussionThreadDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertCourseBelongsToInstitute(
        tx,
        dto.courseId,
        dto.instituteId,
      );
      await this.assertUserBelongsToInstitute(
        tx,
        dto.authorUserId,
        dto.instituteId,
      );

      const thread = await tx.discussionThread.create({
        data: {
          instituteId: dto.instituteId,
          courseId: dto.courseId,
          authorUserId: dto.authorUserId,
          title: dto.title,
          body: dto.body,
          status: dto.status ?? undefined,
          isAnnouncement: dto.isAnnouncement ?? undefined,
          viewCount: dto.viewCount ?? undefined,
          lastActivityAt: dto.lastActivityAt
            ? new Date(dto.lastActivityAt)
            : undefined,
        },
      });

      this.logger.log(
        `DiscussionThread created: ${thread.id} (${thread.title})`,
      );
      return thread;
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListDiscussionThreadsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.discussionThread.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'lastActivityAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.DiscussionThreadWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.authorUserId ? { authorUserId: query.authorUserId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isAnnouncement !== undefined
        ? { isAnnouncement: query.isAnnouncement }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { body: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.discussionThread.count({ where }),
      this.prisma.discussionThread.findMany({
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
    const thread = await this.prisma.discussionThread.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!thread) {
      throw new NotFoundException(`DiscussionThread ${id} not found.`);
    }
    return thread;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateDiscussionThreadDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.discussionThread.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`DiscussionThread ${id} not found.`);
      }

      const nextCourseId =
        dto.courseId !== undefined ? dto.courseId : existing.courseId;
      const nextAuthorUserId =
        dto.authorUserId !== undefined
          ? dto.authorUserId
          : existing.authorUserId;

      if (
        dto.courseId !== undefined &&
        nextCourseId !== existing.courseId
      ) {
        await this.assertCourseBelongsToInstitute(
          tx,
          nextCourseId,
          existing.instituteId,
        );
      }
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

      return tx.discussionThread.update({
        where: { id },
        data: {
          courseId: dto.courseId ?? undefined,
          authorUserId: dto.authorUserId ?? undefined,
          title: dto.title ?? undefined,
          body: dto.body ?? undefined,
          status: dto.status ?? undefined,
          isAnnouncement:
            dto.isAnnouncement === undefined ? undefined : dto.isAnnouncement,
          viewCount: dto.viewCount === undefined ? undefined : dto.viewCount,
          lastActivityAt: dto.lastActivityAt
            ? new Date(dto.lastActivityAt)
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
    return this.prisma.discussionThread.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.discussionThread.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`DiscussionThread ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate references on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertCourseBelongsToInstitute(
        tx,
        existing.courseId,
        existing.instituteId,
      );
      await this.assertUserBelongsToInstitute(
        tx,
        existing.authorUserId,
        existing.instituteId,
      );

      return tx.discussionThread.update({
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

  private async assertCourseBelongsToInstitute(
    tx: Prisma.TransactionClient,
    courseId: string,
    instituteId: string,
  ) {
    const course = await tx.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found.`);
    }
    if (course.instituteId !== instituteId) {
      throw new BadRequestException(
        `Course ${courseId} does not belong to institute ${instituteId}.`,
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
}
