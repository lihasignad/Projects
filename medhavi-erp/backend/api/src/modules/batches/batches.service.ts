import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, BatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { ListBatchesQueryDto } from './dto/list-batches.query';
import { UpdateBatchDto } from './dto/update-batch.dto';

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

/**
 * BatchesService
 *
 * CRUD + soft delete for the Batch aggregate. Audit logging is intentionally
 * omitted in this revision (parity with programs.service); AuditAction is
 * re-exported so a follow-up can re-wire AuditService without touching
 * controllers.
 *
 * Invariants enforced:
 *  - `code` is unique per program — proactive + P2002.
 *  - `programId` must reference a non-deleted Program belonging to the same
 *    `instituteId`.
 *  - `academicYearId` must reference an AcademicYear belonging to the same
 *    `instituteId`.
 *  - `intakeYear <= expectedGradYear`.
 *  - `startDate <= endDate` (when `endDate` is provided).
 *  - `filledSeats <= sanctionedSeats` (and both >= 0).
 */
@Injectable()
export class BatchesService {
  private readonly logger = new Logger(BatchesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateBatchDto) {
    await this.assertInstituteExists(dto.instituteId);
    await this.assertProgramBelongsToInstitute(dto.programId, dto.instituteId);
    await this.assertAcademicYearBelongsToInstitute(
      dto.academicYearId,
      dto.instituteId,
    );
    await this.assertCodeUnique(dto.programId, dto.code);

    const filledSeats = dto.filledSeats ?? 0;
    this.assertBusinessInvariants({
      intakeYear: dto.intakeYear,
      expectedGradYear: dto.expectedGradYear,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      sanctionedSeats: dto.sanctionedSeats,
      filledSeats,
    });

    try {
      const batch = await this.prisma.batch.create({
        data: {
          instituteId: dto.instituteId,
          programId: dto.programId,
          academicYearId: dto.academicYearId,
          code: dto.code,
          name: dto.name,
          intakeYear: dto.intakeYear,
          expectedGradYear: dto.expectedGradYear,
          startDate: new Date(dto.startDate),
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          sanctionedSeats: dto.sanctionedSeats,
          filledSeats,
          currentTermSeq: dto.currentTermSeq ?? null,
          status: dto.status ?? BatchStatus.UPCOMING,
          metadata: (dto.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        },
      });

      this.logger.log(`Batch created: ${batch.id} (${batch.code})`);
      return batch;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Batch code "${dto.code}" already exists for this program.`,
        );
      }
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListBatchesQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.batch.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.BatchWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.programId ? { programId: query.programId } : {}),
      ...(query.academicYearId
        ? { academicYearId: query.academicYearId }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.intakeYear !== undefined
        ? { intakeYear: query.intakeYear }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.batch.count({ where }),
      this.prisma.batch.findMany({
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
    const batch = await this.prisma.batch.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!batch) throw new NotFoundException(`Batch ${id} not found.`);
    return batch;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateBatchDto) {
    const existing = await this.findOne(id);

    if (dto.academicYearId && dto.academicYearId !== existing.academicYearId) {
      await this.assertAcademicYearBelongsToInstitute(
        dto.academicYearId,
        existing.instituteId,
      );
    }

    if (dto.code && dto.code !== existing.code) {
      await this.assertCodeUnique(existing.programId, dto.code, id);
    }

    const nextIntakeYear = dto.intakeYear ?? existing.intakeYear;
    const nextExpectedGradYear =
      dto.expectedGradYear ?? existing.expectedGradYear;
    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : existing.startDate;
    const nextEndDate =
      dto.endDate === undefined
        ? existing.endDate
        : dto.endDate === null
          ? null
          : new Date(dto.endDate);
    const nextSanctionedSeats =
      dto.sanctionedSeats ?? existing.sanctionedSeats;
    const nextFilledSeats = dto.filledSeats ?? existing.filledSeats;

    this.assertBusinessInvariants({
      intakeYear: nextIntakeYear,
      expectedGradYear: nextExpectedGradYear,
      startDate: nextStartDate,
      endDate: nextEndDate,
      sanctionedSeats: nextSanctionedSeats,
      filledSeats: nextFilledSeats,
    });

    try {
      return await this.prisma.batch.update({
        where: { id },
        data: {
          academicYearId: dto.academicYearId ?? undefined,
          code: dto.code ?? undefined,
          name: dto.name ?? undefined,
          intakeYear: dto.intakeYear ?? undefined,
          expectedGradYear: dto.expectedGradYear ?? undefined,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate:
            dto.endDate === undefined
              ? undefined
              : dto.endDate === null
                ? null
                : new Date(dto.endDate),
          sanctionedSeats: dto.sanctionedSeats ?? undefined,
          filledSeats: dto.filledSeats ?? undefined,
          currentTermSeq:
            dto.currentTermSeq === undefined ? undefined : dto.currentTermSeq,
          status: dto.status ?? undefined,
          metadata:
            dto.metadata === undefined
              ? undefined
              : (dto.metadata as Prisma.InputJsonValue),
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Batch code "${dto.code}" already exists for this program.`,
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
    return this.prisma.batch.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: BatchStatus.DISCONTINUED,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.findOne(id, { includeDeleted: true });
    if (!existing.deletedAt) return existing;

    // Re-validate that the parent program / academic year chain is still
    // alive and consistent, and that the code is still available within the
    // program.
    await this.assertProgramBelongsToInstitute(
      existing.programId,
      existing.instituteId,
    );
    await this.assertAcademicYearBelongsToInstitute(
      existing.academicYearId,
      existing.instituteId,
    );
    await this.assertCodeUnique(
      existing.programId,
      existing.code,
      existing.id,
    );

    return this.prisma.batch.update({
      where: { id: existing.id },
      data: {
        deletedAt: null,
        status: BatchStatus.UPCOMING,
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

  private async assertAcademicYearBelongsToInstitute(
    academicYearId: string,
    instituteId: string,
  ) {
    const ay = await this.prisma.academicYear.findFirst({
      where: { id: academicYearId },
      select: { id: true, instituteId: true },
    });
    if (!ay) {
      throw new NotFoundException(
        `AcademicYear ${academicYearId} not found.`,
      );
    }
    if (ay.instituteId !== instituteId) {
      throw new BadRequestException(
        `AcademicYear ${academicYearId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertCodeUnique(
    programId: string,
    code: string,
    ignoreId?: string,
  ) {
    const clash = await this.prisma.batch.findFirst({
      where: {
        programId,
        code,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `Batch code "${code}" already exists for this program.`,
      );
    }
  }

  private assertBusinessInvariants(params: {
    intakeYear: number;
    expectedGradYear: number;
    startDate: Date | string;
    endDate: Date | string | null;
    sanctionedSeats: number;
    filledSeats: number;
  }) {
    if (params.intakeYear > params.expectedGradYear) {
      throw new BadRequestException(
        'intakeYear must be on or before expectedGradYear.',
      );
    }

    if (params.endDate !== null) {
      const start =
        params.startDate instanceof Date
          ? params.startDate
          : new Date(params.startDate);
      const end =
        params.endDate instanceof Date
          ? params.endDate
          : new Date(params.endDate);
      if (end < start) {
        throw new BadRequestException(
          'endDate must be on or after startDate.',
        );
      }
    }

    if (params.filledSeats > params.sanctionedSeats) {
      throw new BadRequestException(
        'filledSeats cannot exceed sanctionedSeats.',
      );
    }
  }
}
