import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ListFeedbackQueryDto } from './dto/list-feedback.query';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateFeedbackDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.feedback.create({
          data: {
            instituteId: dto.instituteId,
            submittedByUserId: dto.submittedByUserId,
            studentId: dto.studentId ?? undefined,
            targetType: dto.targetType,
            targetId: dto.targetId,
            rating: dto.rating,
            title: dto.title ?? undefined,
            comments: dto.comments ?? undefined,
            isAnonymous: dto.isAnonymous ?? undefined,
            responsesJson: dto.responsesJson !== undefined ? (dto.responsesJson as Prisma.InputJsonValue) : undefined,
            termId: dto.termId ?? undefined,
          },
        });

        this.logger.log(`Feedback created: ${record.id}`);
        return record;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListFeedbackQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.feedback.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.FeedbackWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.submittedByUserId ? { submittedByUserId: query.submittedByUserId } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
      ...(query.targetId ? { targetId: query.targetId } : {}),
      ...(typeof query.rating === 'number' ? { rating: query.rating } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.findMany({
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
    const record = await this.prisma.feedback.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Feedback ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateFeedbackDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feedback.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Feedback ${id} not found.`);
      }



      try {
        return await tx.feedback.update({
          where: { id },
          data: {
            submittedByUserId: dto.submittedByUserId ?? undefined,
            studentId: dto.studentId !== undefined ? (dto.studentId ?? undefined) : undefined,
            targetType: dto.targetType ?? undefined,
            targetId: dto.targetId ?? undefined,
            rating: dto.rating ?? undefined,
            title: dto.title !== undefined ? (dto.title ?? undefined) : undefined,
            comments: dto.comments !== undefined ? (dto.comments ?? undefined) : undefined,
            isAnonymous: dto.isAnonymous !== undefined ? (dto.isAnonymous ?? undefined) : undefined,
            responsesJson: dto.responsesJson !== undefined ? (dto.responsesJson as Prisma.InputJsonValue) : undefined,
            termId: dto.termId !== undefined ? (dto.termId ?? undefined) : undefined,
          },
        });
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.feedback.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feedback.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Feedback ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.feedback.update({
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
    const inst = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!inst) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }


  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Feedback with the same unique fields already exists.',
      );
    }
  }
}
