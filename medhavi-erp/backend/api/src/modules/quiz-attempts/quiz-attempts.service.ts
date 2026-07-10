import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, QuizAttemptStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { ListQuizAttemptsQueryDto } from './dto/list-quiz-attempts.query';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';

// Re-exported for future audit-log re-integration (mirrors quizzes.service).
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
 * QuizAttemptsService
 *
 * CRUD + soft delete for the QuizAttempt aggregate. Audit logging is
 * intentionally omitted in this revision (parity with quizzes.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService
 * without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `quizId` references a non-deleted Quiz in the same institute.
 *  - `studentId` references a non-deleted Student in the same institute.
 *  - The quiz availability window is open: now >= quiz.startsAt and
 *    now <= quiz.endsAt.
 *  - `attemptNumber` >= 1 and <= quiz.maxAttempts.
 *  - The composite (quizId, studentId, attemptNumber) is unique.
 *  - `startedAt` defaults to now on creation when omitted.
 *  - `submittedAt`, when provided, is not before `startedAt`.
 *  - `durationSec`, when provided, is not negative.
 *  - `responsesJson` is optional until submission.
 */
@Injectable()
export class QuizAttemptsService {
  private readonly logger = new Logger(QuizAttemptsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateQuizAttemptDto) {
    this.assertAttemptNumber(dto.attemptNumber);
    if (dto.durationSec !== undefined) {
      this.assertDurationSec(dto.durationSec);
    }

    const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date();
    if (dto.startedAt !== undefined && Number.isNaN(startedAt.getTime())) {
      throw new BadRequestException(
        '`startedAt` must be a valid ISO-8601 timestamp.',
      );
    }

    if (dto.submittedAt !== undefined) {
      this.assertSubmittedAfterStarted(dto.submittedAt, startedAt);
    }

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      const quiz = await this.assertQuizBelongsToInstitute(
        tx,
        dto.quizId,
        dto.instituteId,
      );
      await this.assertStudentBelongsToInstitute(
        tx,
        dto.studentId,
        dto.instituteId,
      );

      this.assertQuizWindowOpen(quiz.startsAt, quiz.endsAt);
      this.assertAttemptWithinCap(dto.attemptNumber, quiz.maxAttempts);

      try {
        const attempt = await tx.quizAttempt.create({
          data: {
            instituteId: dto.instituteId,
            quizId: dto.quizId,
            studentId: dto.studentId,
            attemptNumber: dto.attemptNumber,
            status: dto.status ?? undefined,
            startedAt,
            submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
            durationSec: dto.durationSec ?? null,
            responsesJson:
              dto.responsesJson === undefined
                ? Prisma.JsonNull
                : (dto.responsesJson as Prisma.InputJsonValue),
            ipAddress: dto.ipAddress ?? null,
            deviceInfo: dto.deviceInfo ?? null,
            flagsJson:
              dto.flagsJson === undefined
                ? Prisma.JsonNull
                : (dto.flagsJson as Prisma.InputJsonValue),
          },
        });

        this.logger.log(
          `QuizAttempt created: ${attempt.id} (institute=${attempt.instituteId}, quiz=${attempt.quizId}, student=${attempt.studentId}, #${attempt.attemptNumber})`,
        );
        return attempt;
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
    query: ListQuizAttemptsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.quizAttempt.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.QuizAttemptWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.quizId ? { quizId: query.quizId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { deviceInfo: { contains: query.search, mode: 'insensitive' } },
              { ipAddress: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.quizAttempt.count({ where }),
      this.prisma.quizAttempt.findMany({
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
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!attempt) {
      throw new NotFoundException(`QuizAttempt ${id} not found.`);
    }
    return attempt;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateQuizAttemptDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizAttempt.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`QuizAttempt ${id} not found.`);
      }

      if (dto.durationSec !== undefined) {
        this.assertDurationSec(dto.durationSec);
      }

      const effectiveStartedAt = dto.startedAt
        ? new Date(dto.startedAt)
        : existing.startedAt;
      if (dto.startedAt !== undefined && Number.isNaN(effectiveStartedAt.getTime())) {
        throw new BadRequestException(
          '`startedAt` must be a valid ISO-8601 timestamp.',
        );
      }

      const effectiveSubmittedAt =
        dto.submittedAt !== undefined
          ? dto.submittedAt === null
            ? null
            : new Date(dto.submittedAt)
          : existing.submittedAt;
      if (effectiveSubmittedAt !== null && effectiveSubmittedAt !== undefined) {
        this.assertSubmittedAfterStarted(
          effectiveSubmittedAt,
          effectiveStartedAt,
        );
      }

      // Auto-progression: when the caller marks the attempt as submitted
      // without an explicit `submittedAt`, stamp it now (mirrors quizzes
      // style of computing effective values without inventing new fields).
      const autoSubmittedAt =
        dto.status &&
        (dto.status === QuizAttemptStatus.SUBMITTED ||
          dto.status === QuizAttemptStatus.AUTO_SUBMITTED) &&
        !existing.submittedAt &&
        dto.submittedAt === undefined
          ? new Date()
          : undefined;

      try {
        return await tx.quizAttempt.update({
          where: { id },
          data: {
            status: dto.status ?? undefined,
            startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
            submittedAt:
              dto.submittedAt === undefined
                ? (autoSubmittedAt ?? undefined)
                : dto.submittedAt === null
                  ? null
                  : new Date(dto.submittedAt),
            durationSec:
              dto.durationSec === undefined ? undefined : (dto.durationSec ?? null),
            responsesJson:
              dto.responsesJson === undefined
                ? undefined
                : (dto.responsesJson as Prisma.InputJsonValue),
            ipAddress:
              dto.ipAddress === undefined ? undefined : (dto.ipAddress ?? null),
            deviceInfo:
              dto.deviceInfo === undefined ? undefined : (dto.deviceInfo ?? null),
            flagsJson:
              dto.flagsJson === undefined
                ? undefined
                : (dto.flagsJson as Prisma.InputJsonValue),
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
    return this.prisma.quizAttempt.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizAttempt.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`QuizAttempt ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertQuizBelongsToInstitute(
        tx,
        existing.quizId,
        existing.instituteId,
      );
      await this.assertStudentBelongsToInstitute(
        tx,
        existing.studentId,
        existing.instituteId,
      );

      return tx.quizAttempt.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private assertAttemptNumber(attemptNumber: number) {
    if (!Number.isInteger(attemptNumber) || attemptNumber < 1) {
      throw new BadRequestException('`attemptNumber` must be at least 1.');
    }
  }

  private assertDurationSec(durationSec: number) {
    if (!Number.isInteger(durationSec) || durationSec < 0) {
      throw new BadRequestException(
        '`durationSec` must be a non-negative integer.',
      );
    }
  }

  private assertSubmittedAfterStarted(
    submittedAt: string | Date,
    startedAt: Date,
  ) {
    const submitted =
      submittedAt instanceof Date
        ? submittedAt.getTime()
        : new Date(submittedAt).getTime();
    if (Number.isNaN(submitted)) {
      throw new BadRequestException(
        '`submittedAt` must be a valid ISO-8601 timestamp.',
      );
    }
    if (submitted < startedAt.getTime()) {
      throw new BadRequestException(
        '`submittedAt` cannot be before `startedAt`.',
      );
    }
  }

  private assertQuizWindowOpen(startsAt: Date, endsAt: Date) {
    const now = Date.now();
    if (now < startsAt.getTime()) {
      throw new BadRequestException('Quiz has not started yet.');
    }
    if (now > endsAt.getTime()) {
      throw new BadRequestException('Quiz has already ended.');
    }
  }

  private assertAttemptWithinCap(attemptNumber: number, maxAttempts: number) {
    if (attemptNumber > maxAttempts) {
      throw new BadRequestException(
        `\`attemptNumber\` ${attemptNumber} exceeds quiz.maxAttempts (${maxAttempts}).`,
      );
    }
  }

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

  private async assertQuizBelongsToInstitute(
    tx: Prisma.TransactionClient,
    quizId: string,
    instituteId: string,
  ) {
    const quiz = await tx.quiz.findFirst({
      where: { id: quizId, deletedAt: null },
      select: {
        id: true,
        instituteId: true,
        startsAt: true,
        endsAt: true,
        maxAttempts: true,
      },
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz ${quizId} not found.`);
    }
    if (quiz.instituteId !== instituteId) {
      throw new BadRequestException(
        `Quiz ${quizId} does not belong to institute ${instituteId}.`,
      );
    }
    return quiz;
  }

  private async assertStudentBelongsToInstitute(
    tx: Prisma.TransactionClient,
    studentId: string,
    instituteId: string,
  ) {
    const student = await tx.student.findFirst({
      where: { id: studentId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found.`);
    }
    if (student.instituteId !== instituteId) {
      throw new BadRequestException(
        `Student ${studentId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A QuizAttempt with the same (quizId, studentId, attemptNumber) already exists.',
      );
    }
  }
}
