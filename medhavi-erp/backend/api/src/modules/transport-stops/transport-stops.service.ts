import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTransportStopDto } from './dto/create-transport-stop.dto';
import { ListTransportStopsQueryDto } from './dto/list-transport-stops.query';
import { UpdateTransportStopDto } from './dto/update-transport-stop.dto';

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
export class TransportStopsService {
  private readonly logger = new Logger(TransportStopsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateTransportStopDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertSequenceUnique(tx, dto.routeId, dto.sequence);

      try {
        const record = await tx.transportStop.create({
          data: {
            instituteId: dto.instituteId,
            routeId: dto.routeId,
            name: dto.name,
            sequence: dto.sequence,
            pickupTime: dto.pickupTime ?? undefined,
            dropTime: dto.dropTime ?? undefined,
            geoLat: dto.geoLat !== undefined ? new Prisma.Decimal(dto.geoLat) : undefined,
            geoLng: dto.geoLng !== undefined ? new Prisma.Decimal(dto.geoLng) : undefined,
          },
        });

        this.logger.log(`TransportStop created: ${record.id}`);
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
    query: ListTransportStopsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.transportStop.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'sequence';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TransportStopWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.routeId ? { routeId: query.routeId } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.transportStop.count({ where }),
      this.prisma.transportStop.findMany({
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
    const record = await this.prisma.transportStop.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`TransportStop ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateTransportStopDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportStop.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`TransportStop ${id} not found.`);
      }

      if (dto.sequence && dto.sequence !== existing.sequence) {
        await this.assertSequenceUnique(tx, existing.routeId, dto.sequence, id);
      }

      try {
        return await tx.transportStop.update({
          where: { id },
          data: {
            routeId: dto.routeId ?? undefined,
            name: dto.name ?? undefined,
            sequence: dto.sequence ?? undefined,
            pickupTime: dto.pickupTime !== undefined ? (dto.pickupTime ?? undefined) : undefined,
            dropTime: dto.dropTime !== undefined ? (dto.dropTime ?? undefined) : undefined,
            geoLat: dto.geoLat !== undefined ? new Prisma.Decimal(dto.geoLat) : undefined,
            geoLng: dto.geoLng !== undefined ? new Prisma.Decimal(dto.geoLng) : undefined,
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
    return this.prisma.transportStop.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportStop.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`TransportStop ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertSequenceUnique(tx, existing.routeId, existing.sequence, existing.id);

      return tx.transportStop.update({
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

  private async assertSequenceUnique(
    tx: Prisma.TransactionClient,
    routeId: string,
    sequence: number,
    excludeId?: string,
  ) {
    const clash = await tx.transportStop.findFirst({
      where: {
        routeId,
        sequence,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A TransportStop with sequence "${sequence}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A TransportStop with the same unique fields already exists.',
      );
    }
  }
}
