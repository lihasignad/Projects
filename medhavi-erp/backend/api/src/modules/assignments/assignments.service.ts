import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ListAssignmentsQueryDto } from './dto/list-assignments.query';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

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
 * AssignmentsService
 *
 * CRUD + soft delete for the Assignment aggregate. Audit logging is
 * intentionally omitted in this revision (parity with
 * assignment-categories.service); AuditAction is re-exported so a follow-up
 * can re-wire AuditService without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `createdByFacultyId` references a non-deleted Faculty in the institute.
 *  - `categoryId` (when provided) references a non-deleted
 *    AssignmentCategory in the institute.
 *  - `courseId` (when provided) references a non-deleted Course in the
 *    institute.
 *  - `subjectOfferingId` (when provided) references a non-deleted
 *    SubjectOffering in the institute.
 *  - Exactly one of `courseId` / `subjectOfferingId` is provided.
 *  - `dueAt` > `startsAt` (when both set).
 *  - `lateUntil` > `dueAt` (when set).
 *  - `maxAttempts` >= 1.
 *  - `weightPct` and `latePenaltyPct` in [0, 100].
 *  - `maxMarks` > 0.
 */
@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateAssignmentDto) {
    this.assertExactlyOneParent(dto.courseId, dto.subjectOfferingId);
    this.assertNumericInvariants({
      maxMarks: dto.maxMarks,
      weightPct: dto.weightPct,
      latePenaltyPct: dto.latePenaltyPct,
      maxAttempts: dto.maxAttempts,
    });
    this.assertTemporalInvariants({
      startsAt: dto.startsAt,
      dueAt: dto.dueAt,
      lateUntil: dto.lateUntil,
    });

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertFacultyBelongsToInstitute(
        tx,
        dto.createdByFacultyId,
        dto.instituteId,
      );

      if (dto.courseId) {
        await this.assertCourseBelongsToInstitute(
          tx,
          dto.courseId,
          dto.instituteId,
        );
      }
      if (dto.subjectOfferingId) {
        await this.assertSubjectOfferingBelongsToInstitute(
          tx,
          dto.subjectOfferingId,
          dto.instituteId,
        );
      }
      if (dto.categoryId) {
        await this.assertCategoryBelongsToInstitute(
          tx,
          dto.categoryId,
          dto.instituteId,
        );
      }

      try {
        const assignment = await tx.assignment.create({
          data: {
            instituteId: dto.instituteId,
            courseId: dto.courseId ?? null,
            subjectOfferingId: dto.subjectOfferingId ?? null,
            categoryId: dto.categoryId ?? null,
            createdByFacultyId: dto.createdByFacultyId,
            title: dto.title,
            description: dto.description ?? null,
            type: dto.type ?? undefined,
            status: dto.status ?? undefined,
            maxMarks: new Prisma.Decimal(dto.maxMarks),
            weightPct:
              dto.weightPct !== undefined
                ? new Prisma.Decimal(dto.weightPct)
                : undefined,
            publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
            dueAt: new Date(dto.dueAt),
            lateUntil: dto.lateUntil ? new Date(dto.lateUntil) : null,
            latePenaltyPct:
              dto.latePenaltyPct !== undefined
                ? new Prisma.Decimal(dto.latePenaltyPct)
                : undefined,
            allowResubmission: dto.allowResubmission ?? undefined,
            maxAttempts: dto.maxAttempts ?? undefined,
            isGroup: dto.isGroup ?? undefined,
            attachmentsJson:
              dto.attachmentsJson === undefined
                ? undefined
                : (dto.attachmentsJson as Prisma.InputJsonValue),
            rubricJson:
              dto.rubricJson === undefined
                ? undefined
                : (dto.rubricJson as Prisma.InputJsonValue),
          },
        });

        this.logger.log(
          `Assignment created: ${assignment.id} (${assignment.title})`,
        );
        return assignment;
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
    query: ListAssignmentsQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.assignment.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'dueAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.AssignmentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.subjectOfferingId
        ? { subjectOfferingId: query.subjectOfferingId }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.assignment.count({ where }),
      this.prisma.assignment.findMany({
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
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment ${id} not found.`);
    }
    return assignment;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateAssignmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.assignment.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Assignment ${id} not found.`);
      }

      this.assertNumericInvariants({
        maxMarks: dto.maxMarks,
        weightPct: dto.weightPct,
        latePenaltyPct: dto.latePenaltyPct,
        maxAttempts: dto.maxAttempts,
      });

      this.assertTemporalInvariants({
        startsAt:
          dto.startsAt !== undefined
            ? dto.startsAt
            : existing.startsAt?.toISOString(),
        dueAt: dto.dueAt !== undefined ? dto.dueAt : existing.dueAt.toISOString(),
        lateUntil:
          dto.lateUntil !== undefined
            ? dto.lateUntil
            : existing.lateUntil?.toISOString(),
      });

      if (dto.categoryId !== undefined && dto.categoryId !== null) {
        await this.assertCategoryBelongsToInstitute(
          tx,
          dto.categoryId,
          existing.instituteId,
        );
      }

      try {
        return await tx.assignment.update({
          where: { id },
          data: {
            categoryId:
              dto.categoryId === undefined ? undefined : (dto.categoryId ?? null),
            title: dto.title ?? undefined,
            description:
              dto.description === undefined
                ? undefined
                : (dto.description ?? null),
            type: dto.type ?? undefined,
            status: dto.status ?? undefined,
            maxMarks:
              dto.maxMarks === undefined
                ? undefined
                : new Prisma.Decimal(dto.maxMarks),
            weightPct:
              dto.weightPct === undefined
                ? undefined
                : new Prisma.Decimal(dto.weightPct),
            publishedAt:
              dto.publishedAt === undefined
                ? undefined
                : dto.publishedAt
                  ? new Date(dto.publishedAt)
                  : null,
            startsAt:
              dto.startsAt === undefined
                ? undefined
                : dto.startsAt
                  ? new Date(dto.startsAt)
                  : null,
            dueAt: dto.dueAt === undefined ? undefined : new Date(dto.dueAt),
            lateUntil:
              dto.lateUntil === undefined
                ? undefined
                : dto.lateUntil
                  ? new Date(dto.lateUntil)
                  : null,
            latePenaltyPct:
              dto.latePenaltyPct === undefined
                ? undefined
                : new Prisma.Decimal(dto.latePenaltyPct),
            allowResubmission: dto.allowResubmission ?? undefined,
            maxAttempts: dto.maxAttempts ?? undefined,
            isGroup: dto.isGroup ?? undefined,
            attachmentsJson:
              dto.attachmentsJson === undefined
                ? undefined
                : (dto.attachmentsJson as Prisma.InputJsonValue),
            rubricJson:
              dto.rubricJson === undefined
                ? undefined
                : (dto.rubricJson as Prisma.InputJsonValue),
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
    return this.prisma.assignment.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.assignment.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Assignment ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertFacultyBelongsToInstitute(
        tx,
        existing.createdByFacultyId,
        existing.instituteId,
      );
      if (existing.courseId) {
        await this.assertCourseBelongsToInstitute(
          tx,
          existing.courseId,
          existing.instituteId,
        );
      }
      if (existing.subjectOfferingId) {
        await this.assertSubjectOfferingBelongsToInstitute(
          tx,
          existing.subjectOfferingId,
          existing.instituteId,
        );
      }
      if (existing.categoryId) {
        await this.assertCategoryBelongsToInstitute(
          tx,
          existing.categoryId,
          existing.instituteId,
        );
      }

      return tx.assignment.update({
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

  private assertNumericInvariants(input: {
    maxMarks?: number;
    weightPct?: number;
    latePenaltyPct?: number;
    maxAttempts?: number;
  }) {
    if (input.maxMarks !== undefined && !(input.maxMarks > 0)) {
      throw new BadRequestException('`maxMarks` must be greater than 0.');
    }
    if (
      input.weightPct !== undefined &&
      (input.weightPct < 0 || input.weightPct > 100)
    ) {
      throw new BadRequestException('`weightPct` must be between 0 and 100.');
    }
    if (
      input.latePenaltyPct !== undefined &&
      (input.latePenaltyPct < 0 || input.latePenaltyPct > 100)
    ) {
      throw new BadRequestException(
        '`latePenaltyPct` must be between 0 and 100.',
      );
    }
    if (input.maxAttempts !== undefined && input.maxAttempts < 1) {
      throw new BadRequestException('`maxAttempts` must be at least 1.');
    }
  }

  private assertTemporalInvariants(input: {
    startsAt?: string | null;
    dueAt?: string | null;
    lateUntil?: string | null;
  }) {
    const startsAt = input.startsAt ? new Date(input.startsAt) : null;
    const dueAt = input.dueAt ? new Date(input.dueAt) : null;
    const lateUntil = input.lateUntil ? new Date(input.lateUntil) : null;

    if (startsAt && dueAt && dueAt <= startsAt) {
      throw new BadRequestException('`dueAt` must be after `startsAt`.');
    }
    if (dueAt && lateUntil && lateUntil <= dueAt) {
      throw new BadRequestException('`lateUntil` must be after `dueAt`.');
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

  private async assertSubjectOfferingBelongsToInstitute(
    tx: Prisma.TransactionClient,
    subjectOfferingId: string,
    instituteId: string,
  ) {
    const offering = await tx.subjectOffering.findFirst({
      where: { id: subjectOfferingId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!offering) {
      throw new NotFoundException(
        `SubjectOffering ${subjectOfferingId} not found.`,
      );
    }
    if (offering.instituteId !== instituteId) {
      throw new BadRequestException(
        `SubjectOffering ${subjectOfferingId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertCategoryBelongsToInstitute(
    tx: Prisma.TransactionClient,
    categoryId: string,
    instituteId: string,
  ) {
    const category = await tx.assignmentCategory.findFirst({
      where: { id: categoryId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!category) {
      throw new NotFoundException(
        `AssignmentCategory ${categoryId} not found.`,
      );
    }
    if (category.instituteId !== instituteId) {
      throw new BadRequestException(
        `AssignmentCategory ${categoryId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'An Assignment with a conflicting unique field already exists.',
      );
    }
  }
}
