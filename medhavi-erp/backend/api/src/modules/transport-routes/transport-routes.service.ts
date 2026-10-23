import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTransportRouteDto } from './dto/create-transport-route.dto';
import { ListTransportRoutesQueryDto } from './dto/list-transport-routes.query';
import { UpdateTransportRouteDto } from './dto/update-transport-route.dto';

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
export class TransportRoutesService {
  private readonly logger = new Logger(TransportRoutesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateTransportRouteDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertCodeUnique(tx, dto.instituteId, dto.code);

      try {
        const record = await tx.transportRoute.create({
          data: {
            instituteId: dto.instituteId,
            code: dto.code,
            name: dto.name,
            origin: dto.origin,
            destination: dto.destination,
            distanceKm: dto.distanceKm !== undefined ? new Prisma.Decimal(dto.distanceKm) : undefined,
            feePerTerm: dto.feePerTerm !== undefined ? new Prisma.Decimal(dto.feePerTerm) : undefined,
            isActive: dto.isActive ?? undefined,
          },
        });

        this.logger.log(`TransportRoute created: ${record.id}`);
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
    query: ListTransportRoutesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.transportRoute.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'code';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TransportRouteWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
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
      this.prisma.transportRoute.count({ where }),
      this.prisma.transportRoute.findMany({
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
    const record = await this.prisma.transportRoute.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`TransportRoute ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateTransportRouteDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportRoute.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`TransportRoute ${id} not found.`);
      }

      if (dto.code && dto.code !== existing.code) {
        await this.assertCodeUnique(tx, existing.instituteId, dto.code, id);
      }

      try {
        return await tx.transportRoute.update({
          where: { id },
          data: {
            code: dto.code ?? undefined,
            name: dto.name ?? undefined,
            origin: dto.origin ?? undefined,
            destination: dto.destination ?? undefined,
            distanceKm: dto.distanceKm !== undefined ? new Prisma.Decimal(dto.distanceKm) : undefined,
            feePerTerm: dto.feePerTerm !== undefined ? new Prisma.Decimal(dto.feePerTerm) : undefined,
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
    return this.prisma.transportRoute.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportRoute.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`TransportRoute ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertCodeUnique(tx, existing.instituteId, existing.code, existing.id);

      return tx.transportRoute.update({
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
    const clash = await tx.transportRoute.findFirst({
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
        `A TransportRoute with code "${code}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A TransportRoute with the same unique fields already exists.',
      );
    }
  }
}
