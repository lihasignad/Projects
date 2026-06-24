import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, OrgUnitStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query';
import { UpdateDepartmentDto } from './dto/update-department.dto';

// Re-exported for future audit-log re-integration (mirrors schools.service).
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
 * DepartmentsService
 *
 * CRUD + soft delete for the Department aggregate. Audit logging is
 * intentionally omitted in this revision (parity with schools.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService without
 * touching controllers.
 *
 * Invariants enforced:
 *  - `code` is unique per institute (and per school) — proactive + P2002.
 *  - `schoolId` must reference a non-deleted School that belongs to the same
 *    `instituteId` AND the same `campusId`.
 *  - `campusId` must reference a non-deleted Campus belonging to the same
 *    `instituteId`.
 *  - `hodUserId`, when provided, must reference an existing User.
 */
@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateDepartmentDto) {
    await this.assertInstituteExists(dto.instituteId);
    await this.assertCampusBelongsToInstitute(dto.campusId, dto.instituteId);
    await this.assertSchoolBelongsToCampus(
      dto.schoolId,
      dto.campusId,
      dto.instituteId,
    );
    if (dto.hodUserId) {
      await this.assertUserExists(dto.hodUserId);
    }
    await this.assertCodeUnique(dto.instituteId, dto.schoolId, dto.code);

    try {
      const department = await this.prisma.department.create({
        data: {
          instituteId: dto.instituteId,
          campusId: dto.campusId,
          schoolId: dto.schoolId,
          code: dto.code,
          name: dto.name,
          shortName: dto.shortName,
          hodUserId: dto.hodUserId,
          status: dto.status ?? OrgUnitStatus.ACTIVE,
          metadata: (dto.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });

      this.logger.log(`Department created: ${department.id} (${department.code})`);
      return department;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Department code "${dto.code}" already exists for this institute or school.`,
        );
      }
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListDepartmentsQueryDto,
  ): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.department.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.DepartmentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
      ...(query.schoolId ? { schoolId: query.schoolId } : {}),
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
      this.prisma.department.count({ where }),
      this.prisma.department.findMany({
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
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!department) throw new NotFoundException(`Department ${id} not found.`);
    return department;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateDepartmentDto) {
    const existing = await this.findOne(id);

    const nextCampusId = dto.campusId ?? existing.campusId;
    const nextSchoolId = dto.schoolId ?? existing.schoolId;

    if (dto.campusId && dto.campusId !== existing.campusId) {
      await this.assertCampusBelongsToInstitute(dto.campusId, existing.instituteId);
    }

    if (
      (dto.schoolId && dto.schoolId !== existing.schoolId) ||
      (dto.campusId && dto.campusId !== existing.campusId)
    ) {
      await this.assertSchoolBelongsToCampus(
        nextSchoolId,
        nextCampusId,
        existing.instituteId,
      );
    }

    if (dto.hodUserId && dto.hodUserId !== existing.hodUserId) {
      await this.assertUserExists(dto.hodUserId);
    }

    if (dto.code && dto.code !== existing.code) {
      await this.assertCodeUnique(
        existing.instituteId,
        nextSchoolId,
        dto.code,
        id,
      );
    }

    try {
      return await this.prisma.department.update({
        where: { id },
        data: {
          campusId: dto.campusId ?? undefined,
          schoolId: dto.schoolId ?? undefined,
          code: dto.code ?? undefined,
          name: dto.name ?? undefined,
          shortName: dto.shortName ?? undefined,
          hodUserId: dto.hodUserId ?? undefined,
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
          `Department code "${dto.code}" already exists for this institute or school.`,
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
    return this.prisma.department.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: OrgUnitStatus.ARCHIVED,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.findOne(id, { includeDeleted: true });
    if (!existing.deletedAt) return existing;

    // Re-validate uniqueness because another department may have taken the
    // code while this one was archived. Also re-validate that the parent
    // school/campus chain is still alive and consistent.
    await this.assertCampusBelongsToInstitute(existing.campusId, existing.instituteId);
    await this.assertSchoolBelongsToCampus(
      existing.schoolId,
      existing.campusId,
      existing.instituteId,
    );
    await this.assertCodeUnique(
      existing.instituteId,
      existing.schoolId,
      existing.code,
      existing.id,
    );

    return this.prisma.department.update({
      where: { id: existing.id },
      data: {
        deletedAt: null,
        status: OrgUnitStatus.ACTIVE,
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
    campusId: string,
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
    if (school.campusId !== campusId) {
      throw new BadRequestException(
        `School ${schoolId} does not belong to campus ${campusId}.`,
      );
    }
  }

  private async assertUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }
  }

  private async assertCodeUnique(
    instituteId: string,
    schoolId: string,
    code: string,
    ignoreId?: string,
  ) {
    const clash = await this.prisma.department.findFirst({
      where: {
        OR: [
          { instituteId, code },
          { schoolId, code },
        ],
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `Department code "${code}" already exists for this institute or school.`,
      );
    }
  }
}
