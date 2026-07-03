import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAssignmentCategoryDto } from './dto/create-assignment-category.dto';
import { ListAssignmentCategoriesQueryDto } from './dto/list-assignment-categories.query';
import { UpdateAssignmentCategoryDto } from './dto/update-assignment-category.dto';

// Re-exported for future audit-log re-integration (mirrors lms-sessions.service).
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
 * AssignmentCategoriesService
 *
 * CRUD + soft delete for the AssignmentCategory aggregate. Audit logging is
 * intentionally omitted in this revision (parity with lms-sessions.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService without
 * touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - Exactly one of `courseId` / `subjectOfferingId` is provided.
 *  - `courseId` (when provided) references a non-deleted Course belonging
 *    to the same institute.
 *  - `subjectOfferingId` (when provided) references a non-deleted
 *    SubjectOffering belonging to the same institute.
 *  - `name` is unique within `(courseId)` and within `(subjectOfferingId)`
 *    among non-deleted rows (matches the Prisma
 *    `@@unique([courseId, name])` and `@@unique([subjectOfferingId, name])`
 *    but ignores soft-deleted rows).
 */
@Injectable()
export class AssignmentCategoriesService {
  private readonly logger = new Logger(AssignmentCategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateAssignmentCategoryDto) {
    this.assertExactlyOneParent(dto.courseId, dto.subjectOfferingId);

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

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

      await this.assertNameUnique(
        tx,
        dto.name,
        dto.courseId ?? null,
        dto.subjectOfferingId ?? null,
      );

      try {
        const category = await tx.assignmentCategory.create({
          data: {
            instituteId: dto.instituteId,
            courseId: dto.courseId ?? null,
            subjectOfferingId: dto.subjectOfferingId ?? null,
            name: dto.name,
            weightPct:
              dto.weightPct !== undefined
                ? new Prisma.Decimal(dto.weightPct)
                : undefined,
            description: dto.description ?? null,
          },
        });

        this.logger.log(
          `AssignmentCategory created: ${category.id} (${category.name})`,
        );
        return category;
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
    query: ListAssignmentCategoriesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.assignmentCategory.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.AssignmentCategoryWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.subjectOfferingId
        ? { subjectOfferingId: query.subjectOfferingId }
        : {}),
      ...(query.search
        ? {
            name: { contains: query.search, mode: 'insensitive' },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.assignmentCategory.count({ where }),
      this.prisma.assignmentCategory.findMany({
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
    const category = await this.prisma.assignmentCategory.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!category) {
      throw new NotFoundException(`AssignmentCategory ${id} not found.`);
    }
    return category;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateAssignmentCategoryDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.assignmentCategory.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`AssignmentCategory ${id} not found.`);
      }

      const nextName = dto.name ?? existing.name;
      const nextCourseId = existing.courseId;
      const nextSubjectOfferingId = existing.subjectOfferingId;

      if (
        dto.name !== undefined &&
        dto.name !== existing.name
      ) {
        await this.assertNameUnique(
          tx,
          nextName,
          nextCourseId,
          nextSubjectOfferingId,
          id,
        );
      }

      try {
        return await tx.assignmentCategory.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            weightPct:
              dto.weightPct === undefined
                ? undefined
                : new Prisma.Decimal(dto.weightPct),
            description:
              dto.description === undefined
                ? undefined
                : (dto.description ?? null),
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
    return this.prisma.assignmentCategory.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.assignmentCategory.findFirst({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(`AssignmentCategory ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy and uniqueness on restore.
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
      await this.assertNameUnique(
        tx,
        existing.name,
        existing.courseId,
        existing.subjectOfferingId,
        existing.id,
      );

      return tx.assignmentCategory.update({
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

  private async assertNameUnique(
    tx: Prisma.TransactionClient,
    name: string,
    courseId: string | null,
    subjectOfferingId: string | null,
    excludeId?: string,
  ) {
    if (courseId) {
      const clash = await tx.assignmentCategory.findFirst({
        where: {
          courseId,
          name,
          deletedAt: null,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (clash) {
        throw new ConflictException(
          `An AssignmentCategory named "${name}" already exists within this course.`,
        );
      }
    }
    if (subjectOfferingId) {
      const clash = await tx.assignmentCategory.findFirst({
        where: {
          subjectOfferingId,
          name,
          deletedAt: null,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (clash) {
        throw new ConflictException(
          `An AssignmentCategory named "${name}" already exists within this subject offering.`,
        );
      }
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'An AssignmentCategory with the same name already exists within this course or subject offering.',
      );
    }
  }
}
