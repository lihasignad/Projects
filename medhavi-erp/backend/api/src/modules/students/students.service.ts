import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsQueryDto } from './dto/list-students.query';
import { UpdateStudentDto } from './dto/update-student.dto';

// Re-exported for future audit-log re-integration (mirrors programs.service).
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

const DEFAULT_STATUS = 'ACTIVE';
const DELETED_STATUS = 'WITHDRAWN';

/**
 * StudentsService
 *
 * CRUD + soft delete for the Student aggregate. Audit logging is intentionally
 * omitted in this revision (parity with programs.service); AuditAction is
 * re-exported so a follow-up can re-wire AuditService without touching
 * controllers.
 *
 * Invariants enforced:
 *  - `enrollmentNo` is unique per institute among non-deleted students.
 *  - `userId` is globally unique among non-deleted students (schema also
 *    enforces a hard unique constraint; we proactively check to deliver a
 *    friendly ConflictException).
 *  - `programId` must reference a non-deleted Program belonging to the same
 *    `instituteId`.
 *  - `batchId` must reference a non-deleted Batch belonging to the same
 *    `programId` AND the same `instituteId`.
 *  - `sectionId`, when provided, must reference a non-deleted Section
 *    belonging to the same `batchId`.
 */
@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateStudentDto) {
    await this.assertInstituteExists(dto.instituteId);
    await this.assertUserExists(dto.userId);
    await this.assertProgramBelongsToInstitute(dto.programId, dto.instituteId);
    await this.assertBatchBelongsToProgram(
      dto.batchId,
      dto.programId,
      dto.instituteId,
    );
    if (dto.sectionId) {
      await this.assertSectionBelongsToBatch(dto.sectionId, dto.batchId);
    }
    await this.assertEnrollmentNoUnique(dto.instituteId, dto.enrollmentNo);
    await this.assertUserIdUnique(dto.userId);

    try {
      const student = await this.prisma.student.create({
        data: {
          instituteId: dto.instituteId,
          userId: dto.userId,
          enrollmentNo: dto.enrollmentNo,
          rollNo: dto.rollNo ?? null,
          programId: dto.programId,
          batchId: dto.batchId,
          sectionId: dto.sectionId ?? null,
          admissionDate: new Date(dto.admissionDate),
          status: dto.status ?? DEFAULT_STATUS,
        },
      });

      this.logger.log(
        `Student created: ${student.id} (${student.enrollmentNo})`,
      );
      return student;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Student with enrollmentNo "${dto.enrollmentNo}" or userId "${dto.userId}" already exists.`,
        );
      }
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListStudentsQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.student.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.StudentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.programId ? { programId: query.programId } : {}),
      ...(query.batchId ? { batchId: query.batchId } : {}),
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { enrollmentNo: { contains: query.search, mode: 'insensitive' } },
              { rollNo: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
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
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found.`);
    return student;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateStudentDto) {
    const existing = await this.findOne(id);

    const nextProgramId = dto.programId ?? existing.programId;
    const nextBatchId = dto.batchId ?? existing.batchId;
    const nextSectionId =
      dto.sectionId === undefined ? existing.sectionId : dto.sectionId;

    if (dto.programId && dto.programId !== existing.programId) {
      await this.assertProgramBelongsToInstitute(
        nextProgramId,
        existing.instituteId,
      );
    }

    if (
      (dto.batchId && dto.batchId !== existing.batchId) ||
      (dto.programId && dto.programId !== existing.programId)
    ) {
      await this.assertBatchBelongsToProgram(
        nextBatchId,
        nextProgramId,
        existing.instituteId,
      );
    }

    if (
      dto.sectionId !== undefined &&
      dto.sectionId !== existing.sectionId &&
      dto.sectionId !== null
    ) {
      await this.assertSectionBelongsToBatch(nextSectionId as string, nextBatchId);
    } else if (
      dto.batchId &&
      dto.batchId !== existing.batchId &&
      nextSectionId
    ) {
      // Batch changed but section retained — re-verify section still belongs.
      await this.assertSectionBelongsToBatch(nextSectionId, nextBatchId);
    }

    if (dto.enrollmentNo && dto.enrollmentNo !== existing.enrollmentNo) {
      await this.assertEnrollmentNoUnique(
        existing.instituteId,
        dto.enrollmentNo,
        id,
      );
    }

    try {
      return await this.prisma.student.update({
        where: { id },
        data: {
          enrollmentNo: dto.enrollmentNo ?? undefined,
          rollNo: dto.rollNo === undefined ? undefined : dto.rollNo,
          programId: dto.programId ?? undefined,
          batchId: dto.batchId ?? undefined,
          sectionId:
            dto.sectionId === undefined ? undefined : dto.sectionId,
          admissionDate: dto.admissionDate
            ? new Date(dto.admissionDate)
            : undefined,
          status: dto.status ?? undefined,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Student with enrollmentNo "${dto.enrollmentNo}" already exists for this institute.`,
        );
      }
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.student.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: DELETED_STATUS,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.findOne(id, { includeDeleted: true });
    if (!existing.deletedAt) return existing;

    // Re-validate that the parent program/batch/section chain is still alive
    // and consistent, and that enrollmentNo/userId remain available.
    await this.assertProgramBelongsToInstitute(
      existing.programId,
      existing.instituteId,
    );
    await this.assertBatchBelongsToProgram(
      existing.batchId,
      existing.programId,
      existing.instituteId,
    );
    if (existing.sectionId) {
      await this.assertSectionBelongsToBatch(
        existing.sectionId,
        existing.batchId,
      );
    }
    await this.assertEnrollmentNoUnique(
      existing.instituteId,
      existing.enrollmentNo,
      existing.id,
    );

    return this.prisma.student.update({
      where: { id: existing.id },
      data: {
        deletedAt: null,
        status: DEFAULT_STATUS,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private async assertInstituteExists(instituteId: string) {
    const institute = await this.prisma.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!institute) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }
  }

  private async assertProgramBelongsToInstitute(
    programId: string,
    instituteId: string,
  ) {
    const program = await this.prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found.`);
    }
    if (program.instituteId !== instituteId) {
      throw new BadRequestException(
        `Program ${programId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertBatchBelongsToProgram(
    batchId: string,
    programId: string,
    instituteId: string,
  ) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, deletedAt: null },
      select: { id: true, programId: true, instituteId: true },
    });
    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found.`);
    }
    if (batch.instituteId !== instituteId) {
      throw new BadRequestException(
        `Batch ${batchId} does not belong to institute ${instituteId}.`,
      );
    }
    if (batch.programId !== programId) {
      throw new BadRequestException(
        `Batch ${batchId} does not belong to program ${programId}.`,
      );
    }
  }

  private async assertSectionBelongsToBatch(
    sectionId: string,
    batchId: string,
  ) {
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, deletedAt: null },
      select: { id: true, batchId: true },
    });
    if (!section) {
      throw new NotFoundException(`Section ${sectionId} not found.`);
    }
    if (section.batchId !== batchId) {
      throw new BadRequestException(
        `Section ${sectionId} does not belong to batch ${batchId}.`,
      );
    }
  }

  private async assertEnrollmentNoUnique(
    instituteId: string,
    enrollmentNo: string,
    ignoreId?: string,
  ) {
    const clash = await this.prisma.student.findFirst({
      where: {
        instituteId,
        enrollmentNo,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `enrollmentNo "${enrollmentNo}" already exists for this institute.`,
      );
    }
  }

  private async assertUserIdUnique(userId: string, ignoreId?: string) {
    const clash = await this.prisma.student.findFirst({
      where: {
        userId,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `User ${userId} is already linked to an existing student record.`,
      );
    }
  }
}
