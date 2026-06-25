import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AcademicYearStatus, AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { ListAcademicYearsQueryDto } from './dto/list-academic-years.query';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

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
 * AcademicYearsService
 *
 * CRUD + soft delete for the AcademicYear aggregate. Audit logging is
 * intentionally omitted in this revision (parity with programs.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService without
 * touching controllers.
 *
 * Invariants enforced:
 *  - `code` is unique per institute (non-deleted rows) — proactive + P2002.
 *  - `name` is unique per institute (non-deleted rows).
 *  - `startDate` must be strictly before `endDate`.
 *  - No two non-deleted AYs of the same institute may overlap.
 *  - At most one non-deleted AY per institute may have `status = ACTIVE`.
 *  - `isCurrent = true` is treated like ACTIVE for the singleton check.
 *  - The parent institute must exist and not be soft-deleted.
 */
@Injectable()
export class AcademicYearsService {
  private readonly logger = new Logger(AcademicYearsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateAcademicYearDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.assertDateOrder(startDate, endDate);

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(dto.instituteId, tx);
      await this.assertCodeUnique(dto.instituteId, dto.code, undefined, tx);
      await this.assertNameUnique(dto.instituteId, dto.name, undefined, tx);
      await this.assertNoOverlap(
        dto.instituteId,
        startDate,
        endDate,
        undefined,
        tx,
      );

      const status = dto.status ?? AcademicYearStatus.PLANNED;
      const isCurrent = dto.isCurrent ?? false;
      if (status === AcademicYearStatus.ACTIVE || isCurrent) {
        await this.assertSingleActive(dto.instituteId, undefined, tx);
      }

      try {
        const academicYear = await tx.academicYear.create({
          data: {
            instituteId: dto.instituteId,
            code: dto.code,
            name: dto.name,
            startDate,
            endDate,
            status,
            isCurrent,
            metadata: (dto.metadata ?? undefined) as
              | Prisma.InputJsonValue
              | undefined,
          },
        });

        this.logger.log(
          `AcademicYear created: ${academicYear.id} (${academicYear.code})`,
        );
        return academicYear;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new ConflictException(
            `AcademicYear code "${dto.code}" or name "${dto.name}" already exists for this institute.`,
          );
        }
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListAcademicYearsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.academicYear.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'startDate';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.AcademicYearWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isCurrent !== undefined ? { isCurrent: query.isCurrent } : {}),
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
      this.prisma.academicYear.count({ where }),
      this.prisma.academicYear.findMany({
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
    const academicYear = await this.prisma.academicYear.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!academicYear)
      throw new NotFoundException(`AcademicYear ${id} not found.`);
    return academicYear;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateAcademicYearDto) {
    const existing = await this.findOne(id);

    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : existing.startDate;
    const nextEndDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    if (dto.startDate || dto.endDate) {
      this.assertDateOrder(nextStartDate, nextEndDate);
    }

    const nextStatus = dto.status ?? existing.status;
    const nextIsCurrent =
      dto.isCurrent === undefined ? existing.isCurrent : dto.isCurrent;

    return this.prisma.$transaction(async (tx) => {
      if (dto.code && dto.code !== existing.code) {
        await this.assertCodeUnique(existing.instituteId, dto.code, id, tx);
      }
      if (dto.name && dto.name !== existing.name) {
        await this.assertNameUnique(existing.instituteId, dto.name, id, tx);
      }
      if (dto.startDate || dto.endDate) {
        await this.assertNoOverlap(
          existing.instituteId,
          nextStartDate,
          nextEndDate,
          id,
          tx,
        );
      }

      const wasActive =
        existing.status === AcademicYearStatus.ACTIVE || existing.isCurrent;
      const willBeActive =
        nextStatus === AcademicYearStatus.ACTIVE || nextIsCurrent;
      if (willBeActive && !wasActive) {
        await this.assertSingleActive(existing.instituteId, id, tx);
      }

      try {
        return await tx.academicYear.update({
          where: { id },
          data: {
            code: dto.code ?? undefined,
            name: dto.name ?? undefined,
            startDate: dto.startDate ? nextStartDate : undefined,
            endDate: dto.endDate ? nextEndDate : undefined,
            status: dto.status ?? undefined,
            isCurrent: dto.isCurrent === undefined ? undefined : dto.isCurrent,
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
            `AcademicYear code "${dto.code ?? existing.code}" or name "${dto.name ?? existing.name}" already exists for this institute.`,
          );
        }
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.academicYear.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: AcademicYearStatus.ARCHIVED,
        isCurrent: false,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.findOne(id, { includeDeleted: true });
    if (!existing.deletedAt) return existing;

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(existing.instituteId, tx);
      await this.assertCodeUnique(
        existing.instituteId,
        existing.code,
        existing.id,
        tx,
      );
      await this.assertNameUnique(
        existing.instituteId,
        existing.name,
        existing.id,
        tx,
      );
      await this.assertNoOverlap(
        existing.instituteId,
        existing.startDate,
        existing.endDate,
        existing.id,
        tx,
      );

      return tx.academicYear.update({
        where: { id: existing.id },
        data: {
          deletedAt: null,
          status: AcademicYearStatus.PLANNED,
          isCurrent: false,
        },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private assertDateOrder(startDate: Date, endDate: Date) {
    if (!(startDate.getTime() < endDate.getTime())) {
      throw new BadRequestException('startDate must be before endDate.');
    }
  }

  private async assertInstituteExists(
    instituteId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const institute = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!institute) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertCodeUnique(
    instituteId: string,
    code: string,
    ignoreId?: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const clash = await tx.academicYear.findFirst({
      where: {
        instituteId,
        code,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `AcademicYear code "${code}" already exists for this institute.`,
      );
    }
  }

  private async assertNameUnique(
    instituteId: string,
    name: string,
    ignoreId?: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const clash = await tx.academicYear.findFirst({
      where: {
        instituteId,
        name,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `AcademicYear name "${name}" already exists for this institute.`,
      );
    }
  }

  private async assertNoOverlap(
    instituteId: string,
    startDate: Date,
    endDate: Date,
    ignoreId?: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    // Two ranges [a1,a2] and [b1,b2] overlap iff a1 <= b2 AND a2 >= b1.
    const overlap = await tx.academicYear.findFirst({
      where: {
        instituteId,
        deletedAt: null,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true, code: true },
    });
    if (overlap) {
      throw new ConflictException(
        `AcademicYear date range overlaps with existing year "${overlap.code}" in this institute.`,
      );
    }
  }

  private async assertSingleActive(
    instituteId: string,
    ignoreId?: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const active = await tx.academicYear.findFirst({
      where: {
        instituteId,
        deletedAt: null,
        OR: [{ status: AcademicYearStatus.ACTIVE }, { isCurrent: true }],
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true, code: true },
    });
    if (active) {
      throw new ConflictException(
        `Institute already has an ACTIVE academic year ("${active.code}"). Archive it before activating another.`,
      );
    }
  }
}
