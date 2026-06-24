import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, ProgramStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { ListProgramsQueryDto } from './dto/list-programs.query';
import { UpdateProgramDto } from './dto/update-program.dto';

// Re-exported for future audit-log re-integration (mirrors departments.service).
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
 * ProgramsService
 *
 * CRUD + soft delete for the Program aggregate. Audit logging is intentionally
 * omitted in this revision (parity with departments.service); AuditAction is
 * re-exported so a follow-up can re-wire AuditService without touching
 * controllers.
 *
 * Invariants enforced:
 *  - `code` is unique per institute — proactive + P2002.
 *  - `departmentId` must reference a non-deleted Department that belongs to
 *    the same `schoolId` AND the same `instituteId`.
 *  - `schoolId` must reference a non-deleted School that belongs to the same
 *    `instituteId` AND, when `campusId` is provided, the same `campusId`.
 *  - `campusId`, when provided, must reference a non-deleted Campus belonging
 *    to the same `instituteId`.
 */
@Injectable()
export class ProgramsService {
  private readonly logger = new Logger(ProgramsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateProgramDto) {
    await this.assertInstituteExists(dto.instituteId);
    if (dto.campusId) {
      await this.assertCampusBelongsToInstitute(dto.campusId, dto.instituteId);
    }
    await this.assertSchoolBelongsToCampus(
      dto.schoolId,
      dto.campusId ?? null,
      dto.instituteId,
    );
    await this.assertDepartmentBelongsToSchool(
      dto.departmentId,
      dto.schoolId,
      dto.instituteId,
    );
    await this.assertCodeUnique(dto.instituteId, dto.code);

    if (dto.effectiveTo && dto.effectiveTo < dto.effectiveFrom) {
      throw new BadRequestException(
        'effectiveTo must be on or after effectiveFrom.',
      );
    }

    try {
      const program = await this.prisma.program.create({
        data: {
          instituteId: dto.instituteId,
          campusId: dto.campusId ?? null,
          schoolId: dto.schoolId,
          departmentId: dto.departmentId,
          code: dto.code,
          name: dto.name,
          shortName: dto.shortName,
          level: dto.level,
          mode: dto.mode ?? undefined,
          durationYears: new Prisma.Decimal(dto.durationYears),
          totalTerms: dto.totalTerms,
          totalCredits: dto.totalCredits,
          minPassCredits: dto.minPassCredits,
          gradingScheme: dto.gradingScheme ?? undefined,
          intakeCapacity: dto.intakeCapacity,
          description: dto.description,
          accreditation: dto.accreditation,
          effectiveFrom: new Date(dto.effectiveFrom),
          effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
          status: dto.status ?? ProgramStatus.DRAFT,
          metadata: (dto.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        },
      });

      this.logger.log(`Program created: ${program.id} (${program.code})`);
      return program;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Program code "${dto.code}" already exists for this institute.`,
        );
      }
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListProgramsQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.program.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ProgramWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
      ...(query.schoolId ? { schoolId: query.schoolId } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.level ? { level: query.level } : {}),
      ...(query.mode ? { mode: query.mode } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { shortName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.program.count({ where }),
      this.prisma.program.findMany({
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
    const program = await this.prisma.program.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!program) throw new NotFoundException(`Program ${id} not found.`);
    return program;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateProgramDto) {
    const existing = await this.findOne(id);

    const nextCampusId =
      dto.campusId === undefined ? existing.campusId : dto.campusId;
    const nextSchoolId = dto.schoolId ?? existing.schoolId;
    const nextDepartmentId = dto.departmentId ?? existing.departmentId;

    if (dto.campusId && dto.campusId !== existing.campusId) {
      await this.assertCampusBelongsToInstitute(
        dto.campusId,
        existing.instituteId,
      );
    }

    if (
      (dto.schoolId && dto.schoolId !== existing.schoolId) ||
      (dto.campusId !== undefined && dto.campusId !== existing.campusId)
    ) {
      await this.assertSchoolBelongsToCampus(
        nextSchoolId,
        nextCampusId,
        existing.instituteId,
      );
    }

    if (
      (dto.departmentId && dto.departmentId !== existing.departmentId) ||
      (dto.schoolId && dto.schoolId !== existing.schoolId)
    ) {
      await this.assertDepartmentBelongsToSchool(
        nextDepartmentId,
        nextSchoolId,
        existing.instituteId,
      );
    }

    if (dto.code && dto.code !== existing.code) {
      await this.assertCodeUnique(existing.instituteId, dto.code, id);
    }

    const nextEffectiveFrom = dto.effectiveFrom
      ? new Date(dto.effectiveFrom)
      : existing.effectiveFrom;
    const nextEffectiveTo =
      dto.effectiveTo === undefined
        ? existing.effectiveTo
        : dto.effectiveTo === null
          ? null
          : new Date(dto.effectiveTo);
    if (nextEffectiveTo && nextEffectiveTo < nextEffectiveFrom) {
      throw new BadRequestException(
        'effectiveTo must be on or after effectiveFrom.',
      );
    }

    try {
      return await this.prisma.program.update({
        where: { id },
        data: {
          campusId: dto.campusId === undefined ? undefined : dto.campusId,
          schoolId: dto.schoolId ?? undefined,
          departmentId: dto.departmentId ?? undefined,
          code: dto.code ?? undefined,
          name: dto.name ?? undefined,
          shortName: dto.shortName ?? undefined,
          level: dto.level ?? undefined,
          mode: dto.mode ?? undefined,
          durationYears:
            dto.durationYears === undefined
              ? undefined
              : new Prisma.Decimal(dto.durationYears),
          totalTerms: dto.totalTerms ?? undefined,
          totalCredits: dto.totalCredits ?? undefined,
          minPassCredits: dto.minPassCredits ?? undefined,
          gradingScheme: dto.gradingScheme ?? undefined,
          intakeCapacity: dto.intakeCapacity ?? undefined,
          description: dto.description ?? undefined,
          accreditation: dto.accreditation ?? undefined,
          effectiveFrom: dto.effectiveFrom
            ? new Date(dto.effectiveFrom)
            : undefined,
          effectiveTo:
            dto.effectiveTo === undefined
              ? undefined
              : dto.effectiveTo === null
                ? null
                : new Date(dto.effectiveTo),
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
          `Program code "${dto.code}" already exists for this institute.`,
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
    return this.prisma.program.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: ProgramStatus.RETIRED,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.findOne(id, { includeDeleted: true });
    if (!existing.deletedAt) return existing;

    // Re-validate that the parent department/school/campus chain is still
    // alive and consistent, and that the code is still available.
    if (existing.campusId) {
      await this.assertCampusBelongsToInstitute(
        existing.campusId,
        existing.instituteId,
      );
    }
    await this.assertSchoolBelongsToCampus(
      existing.schoolId,
      existing.campusId,
      existing.instituteId,
    );
    await this.assertDepartmentBelongsToSchool(
      existing.departmentId,
      existing.schoolId,
      existing.instituteId,
    );
    await this.assertCodeUnique(
      existing.instituteId,
      existing.code,
      existing.id,
    );

    return this.prisma.program.update({
      where: { id: existing.id },
      data: {
        deletedAt: null,
        status: ProgramStatus.DRAFT,
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

  private async assertCampusBelongsToInstitute(
    campusId: string,
    instituteId: string,
  ) {
    const campus = await this.prisma.campus.findFirst({
      where: { id: campusId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!campus) {
      throw new NotFoundException(`Campus ${campusId} not found.`);
    }
    if (campus.instituteId !== instituteId) {
      throw new BadRequestException(
        `Campus ${campusId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertSchoolBelongsToCampus(
    schoolId: string,
    campusId: string | null,
    instituteId: string,
  ) {
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
      select: { id: true, instituteId: true, campusId: true },
    });
    if (!school) {
      throw new NotFoundException(`School ${schoolId} not found.`);
    }
    if (school.instituteId !== instituteId) {
      throw new BadRequestException(
        `School ${schoolId} does not belong to institute ${instituteId}.`,
      );
    }
    if (campusId && school.campusId !== campusId) {
      throw new BadRequestException(
        `School ${schoolId} does not belong to campus ${campusId}.`,
      );
    }
  }

  private async assertDepartmentBelongsToSchool(
    departmentId: string,
    schoolId: string,
    instituteId: string,
  ) {
    const department = await this.prisma.department.findFirst({
      where: { id: departmentId, deletedAt: null },
      select: { id: true, instituteId: true, schoolId: true },
    });
    if (!department) {
      throw new NotFoundException(`Department ${departmentId} not found.`);
    }
    if (department.instituteId !== instituteId) {
      throw new BadRequestException(
        `Department ${departmentId} does not belong to institute ${instituteId}.`,
      );
    }
    if (department.schoolId !== schoolId) {
      throw new BadRequestException(
        `Department ${departmentId} does not belong to school ${schoolId}.`,
      );
    }
  }

  private async assertCodeUnique(
    instituteId: string,
    code: string,
    ignoreId?: string,
  ) {
    const clash = await this.prisma.program.findFirst({
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
        `Program code "${code}" already exists for this institute.`,
      );
    }
  }
}
