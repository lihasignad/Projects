import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { ListHostelsQueryDto } from './dto/list-hostels.query';
import { UpdateHostelDto } from './dto/update-hostel.dto';

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
export class HostelsService {
  private readonly logger = new Logger(HostelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateHostelDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertCodeUnique(tx, dto.instituteId, dto.code);

      try {
        const record = await tx.hostel.create({
          data: {
            instituteId: dto.instituteId,
            campusId: dto.campusId ?? undefined,
            code: dto.code,
            name: dto.name,
            type: dto.type,
            totalRooms: dto.totalRooms ?? undefined,
            totalBeds: dto.totalBeds ?? undefined,
            wardenUserId: dto.wardenUserId ?? undefined,
            address: dto.address ?? undefined,
            amenitiesJson: dto.amenitiesJson !== undefined ? (dto.amenitiesJson as Prisma.InputJsonValue) : undefined,
            isActive: dto.isActive ?? undefined,
          },
        });

        this.logger.log(`Hostel created: ${record.id}`);
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
    query: ListHostelsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.hostel.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'code';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.HostelWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
      ...(query.type ? { type: query.type } : {}),
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
      this.prisma.hostel.count({ where }),
      this.prisma.hostel.findMany({
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
    const record = await this.prisma.hostel.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Hostel ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateHostelDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostel.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Hostel ${id} not found.`);
      }

      if (dto.code && dto.code !== existing.code) {
        await this.assertCodeUnique(tx, existing.instituteId, dto.code, id);
      }

      try {
        return await tx.hostel.update({
          where: { id },
          data: {
            campusId: dto.campusId !== undefined ? (dto.campusId ?? undefined) : undefined,
            code: dto.code ?? undefined,
            name: dto.name ?? undefined,
            type: dto.type ?? undefined,
            totalRooms: dto.totalRooms !== undefined ? (dto.totalRooms ?? undefined) : undefined,
            totalBeds: dto.totalBeds !== undefined ? (dto.totalBeds ?? undefined) : undefined,
            wardenUserId: dto.wardenUserId !== undefined ? (dto.wardenUserId ?? undefined) : undefined,
            address: dto.address !== undefined ? (dto.address ?? undefined) : undefined,
            amenitiesJson: dto.amenitiesJson !== undefined ? (dto.amenitiesJson as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.hostel.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostel.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Hostel ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertCodeUnique(tx, existing.instituteId, existing.code, existing.id);

      return tx.hostel.update({
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
    const clash = await tx.hostel.findFirst({
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
        `A Hostel with code "${code}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Hostel with the same unique fields already exists.',
      );
    }
  }
}
