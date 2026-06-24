import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, OrgUnitStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ListSchoolsQueryDto } from './dto/list-schools.query';
import { UpdateSchoolDto } from './dto/update-school.dto';

// Re-exported for future audit-log re-integration (mirrors campuses.service).
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
 * SchoolsService
 *
 * CRUD + soft delete for the School aggregate. Audit logging is intentionally
 * omitted in this revision (parity with campuses.service); AuditAction is
 * re-exported so a follow-up can re-wire AuditService without touching
 * controllers.
 *
 * Invariants enforced:
 *  - `code` is unique per institute (enforced both proactively and via P2002).
 *  - `campusId` must reference a non-deleted Campus that belongs to the same
 *    `instituteId`.
 *  - `deanUserId`, when provided, must reference an existing User.
 */
@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateSchoolDto) {
    await this.assertInstituteExists(dto.instituteId);
    await this.assertCampusBelongsToInstitute(dto.campusId, dto.instituteId);
    if (dto.deanUserId) {
      await this.assertUserExists(dto.deanUserId);
    }
    await this.assertCodeUnique(dto.instituteId, dto.code);

    try {
      const school = await this.prisma.school.create({
        data: {
          instituteId: dto.instituteId,
          campusId: dto.campusId,
          code: dto.code,
          name: dto.name,
          shortName: dto.shortName,
          deanUserId: dto.deanUserId,
          status: dto.status ?? OrgUnitStatus.ACTIVE,
          metadata: (dto.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });

      this.logger.log(`School created: ${school.id} (${school.code})`);
      return school;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `School code "${dto.code}" already exists for this institute.`,
        );
      }
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListSchoolsQueryDto,
  ): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.school.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.SchoolWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
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
      this.prisma.school.count({ where }),
      this.prisma.school.findMany({
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
    const school = await this.prisma.school.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!school) throw new NotFoundException(`School ${id} not found.`);
    return school;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateSchoolDto) {
    const existing = await this.findOne(id);

    if (dto.campusId && dto.campusId !== existing.campusId) {
      await this.assertCampusBelongsToInstitute(dto.campusId, existing.instituteId);
    }

    if (dto.deanUserId && dto.deanUserId !== existing.deanUserId) {
      await this.assertUserExists(dto.deanUserId);
    }

    if (dto.code && dto.code !== existing.code) {
      await this.assertCodeUnique(existing.instituteId, dto.code, id);
    }

    try {
      return await this.prisma.school.update({
        where: { id },
        data: {
          campusId: dto.campusId ?? undefined,
          code: dto.code ?? undefined,
          name: dto.name ?? undefined,
          shortName: dto.shortName ?? undefined,
          deanUserId: dto.deanUserId ?? undefined,
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
          `School code "${dto.code}" already exists for this institute.`,
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
    return this.prisma.school.update({
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

    // Re-validate uniqueness because another school may have taken the code
    // while this one was archived. Also re-validate that the parent campus
    // is still alive and still under the same institute.
    await this.assertCampusBelongsToInstitute(existing.campusId, existing.instituteId);
    await this.assertCodeUnique(existing.instituteId, existing.code, existing.id);

    return this.prisma.school.update({
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
    code: string,
    ignoreId?: string,
  ) {
    const clash = await this.prisma.school.findFirst({
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
        `School code "${code}" already exists for this institute.`,
      );
    }
  }
}
