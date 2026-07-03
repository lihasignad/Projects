import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizzesQueryDto } from './dto/list-quizzes.query';
import { UpdateQuizDto } from './dto/update-quiz.dto';

// Re-exported for future audit-log re-integration (mirrors quiz-questions.service).
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
 * QuizzesService
 *
 * CRUD + soft delete for the Quiz aggregate. Audit logging is
 * intentionally omitted in this revision (parity with quiz-questions.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService
 * without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `createdByFacultyId` references a non-deleted Faculty in the same institute.
 *  - `quizBankId`, when provided, references a non-deleted QuizBank in the
 *    same institute.
 *  - `courseId`, when provided, references a non-deleted Course.
 *  - `subjectOfferingId`, when provided, references a non-deleted
 *    SubjectOffering.
 *  - Exactly one of `courseId` or `subjectOfferingId` is provided.
 *  - `startsAt` is strictly before `endsAt`.
 *  - `durationMin` > 0.
 *  - `totalMarks` > 0.
 *  - `maxAttempts` >= 1.
 *  - `passingMarks`, when provided, is >= 0 and <= `totalMarks`.
 */
@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateQuizDto) {
    this.assertExactlyOneParent(dto.courseId, dto.subjectOfferingId);
    this.assertTitleNotEmpty(dto.title);
    this.assertWindow(dto.startsAt, dto.endsAt);
    this.assertDuration(dto.durationMin);
    this.assertTotalMarks(dto.totalMarks);
    this.assertMaxAttempts(dto.maxAttempts ?? 1);
    this.assertPassingMarks(dto.passingMarks, dto.totalMarks);

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertFacultyBelongsToInstitute(
        tx,
        dto.createdByFacultyId,
        dto.instituteId,
      );
      if (dto.quizBankId) {
        await this.assertQuizBankBelongsToInstitute(
          tx,
          dto.quizBankId,
          dto.instituteId,
        );
      }
      if (dto.courseId) {
        await this.assertCourseExists(tx, dto.courseId);
      }
      if (dto.subjectOfferingId) {
        await this.assertSubjectOfferingExists(tx, dto.subjectOfferingId);
      }

      try {
        const quiz = await tx.quiz.create({
          data: {
            instituteId: dto.instituteId,
            quizBankId: dto.quizBankId ?? null,
            courseId: dto.courseId ?? null,
            subjectOfferingId: dto.subjectOfferingId ?? null,
            createdByFacultyId: dto.createdByFacultyId,
            title: dto.title,
            instructions: dto.instructions ?? null,
            totalMarks: new Prisma.Decimal(dto.totalMarks),
            durationMin: dto.durationMin,
            startsAt: new Date(dto.startsAt),
            endsAt: new Date(dto.endsAt),
            maxAttempts: dto.maxAttempts ?? undefined,
            shuffleQuestions: dto.shuffleQuestions ?? undefined,
            shuffleOptions: dto.shuffleOptions ?? undefined,
            showResultsImmediately: dto.showResultsImmediately ?? undefined,
            passingMarks:
              dto.passingMarks === undefined || dto.passingMarks === null
                ? null
                : new Prisma.Decimal(dto.passingMarks),
            isProctored: dto.isProctored ?? undefined,
          },
        });

        this.logger.log(
          `Quiz created: ${quiz.id} (institute=${quiz.instituteId}, faculty=${quiz.createdByFacultyId})`,
        );
        return quiz;
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
    query: ListQuizzesQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.quiz.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.QuizWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.quizBankId ? { quizBankId: query.quizBankId } : {}),
      ...(query.createdByFacultyId
        ? { createdByFacultyId: query.createdByFacultyId }
        : {}),
      ...(query.subjectOfferingId
        ? { subjectOfferingId: query.subjectOfferingId }
        : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              {
                instructions: { contains: query.search, mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.quiz.count({ where }),
      this.prisma.quiz.findMany({
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
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz ${id} not found.`);
    }
    return quiz;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateQuizDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quiz.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Quiz ${id} not found.`);
      }

      if (dto.title !== undefined) {
        this.assertTitleNotEmpty(dto.title);
      }
      if (dto.durationMin !== undefined) {
        this.assertDuration(dto.durationMin);
      }
      if (dto.maxAttempts !== undefined) {
        this.assertMaxAttempts(dto.maxAttempts);
      }

      const effectiveTotalMarks =
        dto.totalMarks !== undefined
          ? dto.totalMarks
          : Number(existing.totalMarks);
      if (dto.totalMarks !== undefined) {
        this.assertTotalMarks(dto.totalMarks);
      }

      const effectivePassingMarks =
        dto.passingMarks !== undefined
          ? dto.passingMarks
          : existing.passingMarks === null
            ? null
            : Number(existing.passingMarks);
      this.assertPassingMarks(
        effectivePassingMarks ?? undefined,
        effectiveTotalMarks,
      );

      const effectiveStartsAt = dto.startsAt
        ? new Date(dto.startsAt)
        : existing.startsAt;
      const effectiveEndsAt = dto.endsAt
        ? new Date(dto.endsAt)
        : existing.endsAt;
      if (dto.startsAt !== undefined || dto.endsAt !== undefined) {
        this.assertWindow(
          effectiveStartsAt.toISOString(),
          effectiveEndsAt.toISOString(),
        );
      }

      if (dto.quizBankId !== undefined && dto.quizBankId !== null) {
        await this.assertQuizBankBelongsToInstitute(
          tx,
          dto.quizBankId,
          existing.instituteId,
        );
      }
      if (dto.courseId !== undefined && dto.courseId !== null) {
        await this.assertCourseExists(tx, dto.courseId);
      }
      if (
        dto.subjectOfferingId !== undefined &&
        dto.subjectOfferingId !== null
      ) {
        await this.assertSubjectOfferingExists(tx, dto.subjectOfferingId);
      }

      try {
        return await tx.quiz.update({
          where: { id },
          data: {
            quizBankId:
              dto.quizBankId === undefined ? undefined : (dto.quizBankId ?? null),
            courseId:
              dto.courseId === undefined ? undefined : (dto.courseId ?? null),
            subjectOfferingId:
              dto.subjectOfferingId === undefined
                ? undefined
                : (dto.subjectOfferingId ?? null),
            title: dto.title ?? undefined,
            instructions:
              dto.instructions === undefined
                ? undefined
                : (dto.instructions ?? null),
            totalMarks:
              dto.totalMarks === undefined
                ? undefined
                : new Prisma.Decimal(dto.totalMarks),
            durationMin: dto.durationMin ?? undefined,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
            maxAttempts: dto.maxAttempts ?? undefined,
            shuffleQuestions: dto.shuffleQuestions ?? undefined,
            shuffleOptions: dto.shuffleOptions ?? undefined,
            showResultsImmediately: dto.showResultsImmediately ?? undefined,
            passingMarks:
              dto.passingMarks === undefined
                ? undefined
                : dto.passingMarks === null
                  ? null
                  : new Prisma.Decimal(dto.passingMarks),
            isProctored: dto.isProctored ?? undefined,
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
    return this.prisma.quiz.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quiz.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Quiz ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertFacultyBelongsToInstitute(
        tx,
        existing.createdByFacultyId,
        existing.instituteId,
      );
      if (existing.quizBankId) {
        await this.assertQuizBankBelongsToInstitute(
          tx,
          existing.quizBankId,
          existing.instituteId,
        );
      }
      if (existing.courseId) {
        await this.assertCourseExists(tx, existing.courseId);
      }
      if (existing.subjectOfferingId) {
        await this.assertSubjectOfferingExists(tx, existing.subjectOfferingId);
      }

      return tx.quiz.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private assertExactlyOneParent(
    courseId?: string | null,
    subjectOfferingId?: string | null,
  ) {
    const hasCourse = !!courseId;
    const hasOffering = !!subjectOfferingId;
    if (hasCourse === hasOffering) {
      throw new BadRequestException(
        'Exactly one of `courseId` or `subjectOfferingId` must be provided.',
      );
    }
  }

  private assertTitleNotEmpty(title: string) {
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('`title` cannot be empty.');
    }
  }

  private assertWindow(startsAt: string | Date, endsAt: string | Date) {
    const start =
      startsAt instanceof Date ? startsAt.getTime() : new Date(startsAt).getTime();
    const end =
      endsAt instanceof Date ? endsAt.getTime() : new Date(endsAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new BadRequestException(
        '`startsAt` and `endsAt` must be valid ISO-8601 timestamps.',
      );
    }
    if (!(start < end)) {
      throw new BadRequestException('`startsAt` must be before `endsAt`.');
    }
  }

  private assertDuration(durationMin: number) {
    if (!Number.isInteger(durationMin) || durationMin <= 0) {
      throw new BadRequestException(
        '`durationMin` must be a positive integer.',
      );
    }
  }

  private assertTotalMarks(totalMarks: number) {
    if (!(totalMarks > 0)) {
      throw new BadRequestException('`totalMarks` must be greater than 0.');
    }
  }

  private assertMaxAttempts(maxAttempts: number) {
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
      throw new BadRequestException('`maxAttempts` must be at least 1.');
    }
  }

  private assertPassingMarks(
    passingMarks: number | null | undefined,
    totalMarks: number,
  ) {
    if (passingMarks === undefined || passingMarks === null) return;
    if (passingMarks < 0) {
      throw new BadRequestException('`passingMarks` cannot be negative.');
    }
    if (passingMarks > totalMarks) {
      throw new BadRequestException(
        '`passingMarks` cannot exceed `totalMarks`.',
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

  private async assertFacultyBelongsToInstitute(
    tx: Prisma.TransactionClient,
    facultyId: string,
    instituteId: string,
  ) {
    const faculty = await tx.faculty.findFirst({
      where: { id: facultyId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty ${facultyId} not found.`);
    }
    if (faculty.instituteId !== instituteId) {
      throw new BadRequestException(
        `Faculty ${facultyId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertQuizBankBelongsToInstitute(
    tx: Prisma.TransactionClient,
    quizBankId: string,
    instituteId: string,
  ) {
    const bank = await tx.quizBank.findFirst({
      where: { id: quizBankId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!bank) {
      throw new NotFoundException(`QuizBank ${quizBankId} not found.`);
    }
    if (bank.instituteId !== instituteId) {
      throw new BadRequestException(
        `QuizBank ${quizBankId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertCourseExists(
    tx: Prisma.TransactionClient,
    courseId: string,
  ) {
    const course = await tx.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true },
    });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found.`);
    }
  }

  private async assertSubjectOfferingExists(
    tx: Prisma.TransactionClient,
    subjectOfferingId: string,
  ) {
    const offering = await tx.subjectOffering.findFirst({
      where: { id: subjectOfferingId, deletedAt: null },
      select: { id: true },
    });
    if (!offering) {
      throw new NotFoundException(
        `SubjectOffering ${subjectOfferingId} not found.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Quiz with a conflicting unique field already exists.',
      );
    }
  }
}
