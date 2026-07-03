import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateQuizBankDto } from './dto/create-quiz-bank.dto';
import { ListQuizBanksQueryDto } from './dto/list-quiz-banks.query';
import { UpdateQuizBankDto } from './dto/update-quiz-bank.dto';

// Re-exported for future audit-log re-integration (mirrors
// assignment-categories.service).
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
 * QuizBanksService
 *
 * CRUD + soft delete for the QuizBank aggregate. Audit logging is
 * intentionally omitted in this revision (parity with
 * assignment-categories.service); AuditAction is re-exported so a follow-up
 * can re-wire AuditService without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `ownerFacultyId` references a non-deleted Faculty belonging to the
 *    same institute.
 *  - Exactly one of `courseId` / `subjectId` is provided.
 *  - `courseId` (when provided) references a non-deleted Course belonging
 *    to the same institute.
 *  - `subjectId` (when provided) references a non-deleted Subject
 *    belonging to the same institute.
 *  - `name` is non-empty.
 */
@Injectable()
export class QuizBanksService {
  private readonly logger = new Logger(QuizBanksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateQuizBankDto) {
    this.assertExactlyOneParent(dto.courseId, dto.subjectId);
    this.assertNameNotEmpty(dto.name);

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertFacultyBelongsToInstitute(
        tx,
        dto.ownerFacultyId,
        dto.instituteId,
      );

      if (dto.courseId) {
        await this.assertCourseBelongsToInstitute(
          tx,
          dto.courseId,
          dto.instituteId,
        );
      }
      if (dto.subjectId) {
        await this.assertSubjectBelongsToInstitute(
          tx,
          dto.subjectId,
          dto.instituteId,
        );
      }

      try {
        const bank = await tx.quizBank.create({
          data: {
            instituteId: dto.instituteId,
            ownerFacultyId: dto.ownerFacultyId,
            courseId: dto.courseId ?? null,
            subjectId: dto.subjectId ?? null,
            name: dto.name,
            description: dto.description ?? null,
            isShared: dto.isShared ?? false,
          },
        });

        this.logger.log(`QuizBank created: ${bank.id} (${bank.name})`);
        return bank;
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
    query: ListQuizBanksQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.quizBank.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.QuizBankWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.ownerFacultyId
        ? { ownerFacultyId: query.ownerFacultyId }
        : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.isShared !== undefined ? { isShared: query.isShared } : {}),
      ...(query.search
        ? {
            name: { contains: query.search, mode: 'insensitive' },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.quizBank.count({ where }),
      this.prisma.quizBank.findMany({
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
    const bank = await this.prisma.quizBank.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!bank) {
      throw new NotFoundException(`QuizBank ${id} not found.`);
    }
    return bank;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateQuizBankDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizBank.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`QuizBank ${id} not found.`);
      }

      if (dto.name !== undefined) {
        this.assertNameNotEmpty(dto.name);
      }

      try {
        return await tx.quizBank.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            description:
              dto.description === undefined
                ? undefined
                : (dto.description ?? null),
            isShared: dto.isShared ?? undefined,
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
    return this.prisma.quizBank.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizBank.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`QuizBank ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertFacultyBelongsToInstitute(
        tx,
        existing.ownerFacultyId,
        existing.instituteId,
      );
      if (existing.courseId) {
        await this.assertCourseBelongsToInstitute(
          tx,
          existing.courseId,
          existing.instituteId,
        );
      }
      if (existing.subjectId) {
        await this.assertSubjectBelongsToInstitute(
          tx,
          existing.subjectId,
          existing.instituteId,
        );
      }

      return tx.quizBank.update({
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
    subjectId?: string | null,
  ) {
    const hasCourse = !!courseId;
    const hasSubject = !!subjectId;
    if (hasCourse === hasSubject) {
      throw new BadRequestException(
        'Exactly one of `courseId` or `subjectId` must be provided.',
      );
    }
  }

  private assertNameNotEmpty(name: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException('`name` must not be empty.');
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

  private async assertSubjectBelongsToInstitute(
    tx: Prisma.TransactionClient,
    subjectId: string,
    instituteId: string,
  ) {
    const subject = await tx.subject.findFirst({
      where: { id: subjectId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!subject) {
      throw new NotFoundException(`Subject ${subjectId} not found.`);
    }
    if (subject.instituteId !== instituteId) {
      throw new BadRequestException(
        `Subject ${subjectId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A QuizBank with conflicting unique fields already exists.',
      );
    }
  }
}
