import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events.query';
import { UpdateEventDto } from './dto/update-event.dto';

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
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateEventDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.event.create({
          data: {
            instituteId: dto.instituteId,
            clubId: dto.clubId ?? undefined,
            organizerUserId: dto.organizerUserId,
            title: dto.title,
            description: dto.description ?? undefined,
            category: dto.category ?? undefined,
            startAt: dto.startAt,
            endAt: dto.endAt,
            venue: dto.venue ?? undefined,
            status: dto.status ?? undefined,
            registrationOpensAt: dto.registrationOpensAt ?? undefined,
            registrationClosesAt: dto.registrationClosesAt ?? undefined,
            capacity: dto.capacity ?? undefined,
            feeAmount: dto.feeAmount !== undefined ? new Prisma.Decimal(dto.feeAmount) : undefined,
            bannerUrl: dto.bannerUrl ?? undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Event created: ${record.id}`);
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
    query: ListEventsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.event.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'startAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.EventWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.clubId ? { clubId: query.clubId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
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
    const record = await this.prisma.event.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Event ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateEventDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.event.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Event ${id} not found.`);
      }



      try {
        return await tx.event.update({
          where: { id },
          data: {
            clubId: dto.clubId !== undefined ? (dto.clubId ?? undefined) : undefined,
            organizerUserId: dto.organizerUserId ?? undefined,
            title: dto.title ?? undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            category: dto.category !== undefined ? (dto.category ?? undefined) : undefined,
            startAt: dto.startAt ?? undefined,
            endAt: dto.endAt ?? undefined,
            venue: dto.venue !== undefined ? (dto.venue ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            registrationOpensAt: dto.registrationOpensAt !== undefined ? (dto.registrationOpensAt ?? undefined) : undefined,
            registrationClosesAt: dto.registrationClosesAt !== undefined ? (dto.registrationClosesAt ?? undefined) : undefined,
            capacity: dto.capacity !== undefined ? (dto.capacity ?? undefined) : undefined,
            feeAmount: dto.feeAmount !== undefined ? new Prisma.Decimal(dto.feeAmount) : undefined,
            bannerUrl: dto.bannerUrl !== undefined ? (dto.bannerUrl ?? undefined) : undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.event.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.event.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Event ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.event.update({
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


  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Event with the same unique fields already exists.',
      );
    }
  }
}
