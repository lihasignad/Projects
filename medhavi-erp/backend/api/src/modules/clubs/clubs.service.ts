import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { ListClubsQueryDto } from './dto/list-clubs.query';
import { UpdateClubDto } from './dto/update-club.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateClubDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertCodeUnique(tx, dto.instituteId, dto.code);

      try {
        const record = await tx.club.create({
          data: {
            instituteId: dto.instituteId,
            code: dto.code,
            name: dto.name,
            category: dto.category ?? undefined,
            description: dto.description ?? undefined,
            facultyAdvisorFacultyId: dto.facultyAdvisorFacultyId ?? undefined,
            presidentUserId: dto.presidentUserId ?? undefined,
            foundedOn: dto.foundedOn ?? undefined,
            logoUrl: dto.logoUrl ?? undefined,
            isActive: dto.isActive ?? undefined,
          },
        });

        this.logger.log(`Club created: ${record.id}`);
        return record;
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
    query: ListClubsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.club.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.ClubWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.club.count({ where }),
      this.prisma.club.findMany({
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
    const record = await this.prisma.club.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Club ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateClubDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.club.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Club ${id} not found.`);
      }

      if (dto.code && dto.code !== existing.code) {
        await this.assertCodeUnique(tx, existing.instituteId, dto.code, id);
      }

      try {
        return await tx.club.update({
          where: { id },
          data: {
            code: dto.code ?? undefined,
            name: dto.name ?? undefined,
            category: dto.category !== undefined ? (dto.category ?? undefined) : undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            facultyAdvisorFacultyId: dto.facultyAdvisorFacultyId !== undefined ? (dto.facultyAdvisorFacultyId ?? undefined) : undefined,
            presidentUserId: dto.presidentUserId !== undefined ? (dto.presidentUserId ?? undefined) : undefined,
            foundedOn: dto.foundedOn !== undefined ? (dto.foundedOn ?? undefined) : undefined,
            logoUrl: dto.logoUrl !== undefined ? (dto.logoUrl ?? undefined) : undefined,
            isActive: dto.isActive !== undefined ? (dto.isActive ?? undefined) : undefined,
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
    return this.prisma.club.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.club.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Club ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertCodeUnique(tx, existing.instituteId, existing.code, existing.id);

      return tx.club.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private async assertInstituteExists(
    tx: Prisma.TransactionClient,
    instituteId: string,
  ) {
    const inst = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!inst) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertCodeUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    code: string,
    excludeId?: string,
  ) {
    const clash = await tx.club.findFirst({
      where: {
        instituteId,
        code,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A Club with code "${code}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Club with the same unique fields already exists.',
      );
    }
  }
}
