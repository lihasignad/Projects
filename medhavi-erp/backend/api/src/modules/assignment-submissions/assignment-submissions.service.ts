import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentStatus, AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAssignmentSubmissionDto } from './dto/create-assignment-submission.dto';
import { ListAssignmentSubmissionsQueryDto } from './dto/list-assignment-submissions.query';
import { UpdateAssignmentSubmissionDto } from './dto/update-assignment-submission.dto';

// Re-exported for future audit-log re-integration (mirrors assignments.service).
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
 * AssignmentSubmissionsService
 *
 * CRUD + soft delete for the AssignmentSubmission aggregate. Audit logging
 * is intentionally omitted in this revision (parity with
 * assignments.service); AuditAction is re-exported so a follow-up can
 * re-wire AuditService without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `assignmentId` references a non-deleted Assignment in the institute.
 *  - `studentId` references a non-deleted Student in the institute.
 *  - `gradedByFacultyId` (when provided) references a non-deleted Faculty
 *    in the institute.
 *  - Parent Assignment must be in PUBLISHED status when a submission is
 *    created.
 *  - `attemptNumber` >= 1.
 *  - (`assignmentId`, `studentId`, `attemptNumber`) is unique across
 *    non-deleted rows.
 *  - `marksAwarded` (when provided) cannot exceed Assignment.maxMarks.
 *  - `isLate` is derived from `submittedAt` vs Assignment `dueAt` /
 *    `lateUntil` (server-authoritative).
 *  - `gradedAt` is set to now() whenever `marksAwarded` is provided and
 *    the caller did not supply an explicit value.
 */
@Injectable()
export class AssignmentSubmissionsService {
  private readonly logger = new Logger(AssignmentSubmissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateAssignmentSubmissionDto) {
    const attemptNumber = dto.attemptNumber ?? 1;
    this.assertAttemptNumber(attemptNumber);

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      const assignment = await this.assertAssignmentBelongsToInstitute(
        tx,
        dto.assignmentId,
        dto.instituteId,
      );
      await this.assertStudentBelongsToInstitute(
        tx,
        dto.studentId,
        dto.instituteId,
      );

      if (assignment.status !== AssignmentStatus.PUBLISHED) {
        throw new BadRequestException(
          `Assignment ${assignment.id} must be PUBLISHED before a submission can be created (current status: ${assignment.status}).`,
        );
      }

      if (dto.gradedByFacultyId) {
        await this.assertFacultyBelongsToInstitute(
          tx,
          dto.gradedByFacultyId,
          dto.instituteId,
        );
      }

      if (dto.marksAwarded !== undefined) {
        this.assertMarksWithinMax(dto.marksAwarded, assignment.maxMarks);
      }

      await this.assertAttemptUnique(
        tx,
        dto.assignmentId,
        dto.studentId,
        attemptNumber,
      );

      const submittedAt = dto.submittedAt ? new Date(dto.submittedAt) : null;
      const isLate = this.computeIsLate(submittedAt, {
        dueAt: assignment.dueAt,
        lateUntil: assignment.lateUntil,
      });

      const marksProvided = dto.marksAwarded !== undefined;
      const gradedAt = marksProvided
        ? dto.gradedAt
          ? new Date(dto.gradedAt)
          : new Date()
        : dto.gradedAt
          ? new Date(dto.gradedAt)
          : null;

      try {
        const submission = await tx.assignmentSubmission.create({
          data: {
            instituteId: dto.instituteId,
            assignmentId: dto.assignmentId,
            studentId: dto.studentId,
            attemptNumber,
            status: dto.status ?? undefined,
            submittedAt,
            isLate,
            contentText: dto.contentText ?? null,
            attachmentsJson:
              dto.attachmentsJson === undefined
                ? undefined
                : (dto.attachmentsJson as Prisma.InputJsonValue),
            marksAwarded: marksProvided
              ? new Prisma.Decimal(dto.marksAwarded as number)
              : null,
            feedbackText: dto.feedbackText ?? null,
            rubricResultJson:
              dto.rubricResultJson === undefined
                ? undefined
                : (dto.rubricResultJson as Prisma.InputJsonValue),
            gradedAt,
            gradedByFacultyId: dto.gradedByFacultyId ?? null,
            similarityPct:
              dto.similarityPct !== undefined
                ? new Prisma.Decimal(dto.similarityPct)
                : null,
          },
        });

        this.logger.log(
          `AssignmentSubmission created: ${submission.id} (assignment=${submission.assignmentId}, student=${submission.studentId}, attempt=${submission.attemptNumber})`,
        );
        return submission;
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
    query: ListAssignmentSubmissionsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.assignmentSubmission.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'submittedAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.AssignmentSubmissionWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.assignmentId ? { assignmentId: query.assignmentId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.gradedByFacultyId
        ? { gradedByFacultyId: query.gradedByFacultyId }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isLate !== undefined ? { isLate: query.isLate } : {}),
      ...(query.search
        ? {
            OR: [
              {
                assignment: {
                  title: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                student: {
                  enrollmentNo: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                student: {
                  rollNo: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.assignmentSubmission.count({ where }),
      this.prisma.assignmentSubmission.findMany({
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
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!submission) {
      throw new NotFoundException(`AssignmentSubmission ${id} not found.`);
    }
    return submission;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateAssignmentSubmissionDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.assignmentSubmission.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`AssignmentSubmission ${id} not found.`);
      }

      const assignment = await tx.assignment.findFirst({
        where: { id: existing.assignmentId, deletedAt: null },
        select: {
          id: true,
          maxMarks: true,
          dueAt: true,
          lateUntil: true,
        },
      });
      if (!assignment) {
        throw new NotFoundException(
          `Parent Assignment ${existing.assignmentId} not found.`,
        );
      }

      if (dto.gradedByFacultyId !== undefined && dto.gradedByFacultyId !== null) {
        await this.assertFacultyBelongsToInstitute(
          tx,
          dto.gradedByFacultyId,
          existing.instituteId,
        );
      }

      if (dto.marksAwarded !== undefined) {
        this.assertMarksWithinMax(dto.marksAwarded, assignment.maxMarks);
      }

      const effectiveSubmittedAt =
        dto.submittedAt !== undefined
          ? dto.submittedAt
            ? new Date(dto.submittedAt)
            : null
          : existing.submittedAt;
      const isLate = this.computeIsLate(effectiveSubmittedAt, {
        dueAt: assignment.dueAt,
        lateUntil: assignment.lateUntil,
      });

      const marksProvided = dto.marksAwarded !== undefined;
      const gradedAt =
        dto.gradedAt !== undefined
          ? dto.gradedAt
            ? new Date(dto.gradedAt)
            : null
          : marksProvided
            ? new Date()
            : undefined;

      try {
        return await tx.assignmentSubmission.update({
          where: { id },
          data: {
            status: dto.status ?? undefined,
            submittedAt:
              dto.submittedAt === undefined
                ? undefined
                : dto.submittedAt
                  ? new Date(dto.submittedAt)
                  : null,
            isLate,
            contentText:
              dto.contentText === undefined
                ? undefined
                : (dto.contentText ?? null),
            attachmentsJson:
              dto.attachmentsJson === undefined
                ? undefined
                : (dto.attachmentsJson as Prisma.InputJsonValue),
            marksAwarded:
              dto.marksAwarded === undefined
                ? undefined
                : dto.marksAwarded === null
                  ? null
                  : new Prisma.Decimal(dto.marksAwarded),
            feedbackText:
              dto.feedbackText === undefined
                ? undefined
                : (dto.feedbackText ?? null),
            rubricResultJson:
              dto.rubricResultJson === undefined
                ? undefined
                : (dto.rubricResultJson as Prisma.InputJsonValue),
            gradedAt,
            gradedByFacultyId:
              dto.gradedByFacultyId === undefined
                ? undefined
                : (dto.gradedByFacultyId ?? null),
            similarityPct:
              dto.similarityPct === undefined
                ? undefined
                : new Prisma.Decimal(dto.similarityPct),
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
    return this.prisma.assignmentSubmission.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.assignmentSubmission.findFirst({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(`AssignmentSubmission ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertAssignmentBelongsToInstitute(
        tx,
        existing.assignmentId,
        existing.instituteId,
      );
      await this.assertStudentBelongsToInstitute(
        tx,
        existing.studentId,
        existing.instituteId,
      );
      if (existing.gradedByFacultyId) {
        await this.assertFacultyBelongsToInstitute(
          tx,
          existing.gradedByFacultyId,
          existing.instituteId,
        );
      }

      // Re-check attempt uniqueness against other non-deleted rows.
      await this.assertAttemptUnique(
        tx,
        existing.assignmentId,
        existing.studentId,
        existing.attemptNumber,
        existing.id,
      );

      return tx.assignmentSubmission.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private assertAttemptNumber(attemptNumber: number) {
    if (attemptNumber < 1) {
      throw new BadRequestException('`attemptNumber` must be at least 1.');
    }
  }

  private assertMarksWithinMax(
    marksAwarded: number,
    maxMarks: Prisma.Decimal,
  ) {
    const max = new Prisma.Decimal(maxMarks);
    const awarded = new Prisma.Decimal(marksAwarded);
    if (awarded.greaterThan(max)) {
      throw new BadRequestException(
        `\`marksAwarded\` (${awarded.toString()}) cannot exceed Assignment.maxMarks (${max.toString()}).`,
      );
    }
  }

  private computeIsLate(
    submittedAt: Date | null,
    assignment: { dueAt: Date; lateUntil: Date | null },
  ): boolean {
    if (!submittedAt) return false;
    return submittedAt.getTime() > assignment.dueAt.getTime();
  }

  private async assertAttemptUnique(
    tx: Prisma.TransactionClient,
    assignmentId: string,
    studentId: string,
    attemptNumber: number,
    excludeId?: string,
  ) {
    const clash = await tx.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId,
        attemptNumber,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `An AssignmentSubmission for assignment=${assignmentId}, student=${studentId}, attempt=${attemptNumber} already exists.`,
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

  private async assertAssignmentBelongsToInstitute(
    tx: Prisma.TransactionClient,
    assignmentId: string,
    instituteId: string,
  ) {
    const assignment = await tx.assignment.findFirst({
      where: { id: assignmentId, deletedAt: null },
      select: {
        id: true,
        instituteId: true,
        status: true,
        maxMarks: true,
        dueAt: true,
        lateUntil: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found.`);
    }
    if (assignment.instituteId !== instituteId) {
      throw new BadRequestException(
        `Assignment ${assignmentId} does not belong to institute ${instituteId}.`,
      );
    }
    return assignment;
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

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'An AssignmentSubmission with a conflicting unique field already exists.',
      );
    }
  }
}
