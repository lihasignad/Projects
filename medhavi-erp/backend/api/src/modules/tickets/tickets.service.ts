import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets.query';
import { UpdateTicketDto } from './dto/update-ticket.dto';

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
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertTicketNumberUnique(tx, dto.instituteId, dto.ticketNumber);

      try {
        const record = await tx.ticket.create({
          data: {
            instituteId: dto.instituteId,
            ticketNumber: dto.ticketNumber,
            raisedByUserId: dto.raisedByUserId,
            studentId: dto.studentId ?? undefined,
            category: dto.category,
            priority: dto.priority ?? undefined,
            status: dto.status ?? undefined,
            subject: dto.subject,
            description: dto.description,
            assignedToUserId: dto.assignedToUserId ?? undefined,
            resolutionText: dto.resolutionText ?? undefined,
            attachmentsJson: dto.attachmentsJson !== undefined ? (dto.attachmentsJson as Prisma.InputJsonValue) : undefined,
            threadJson: dto.threadJson !== undefined ? (dto.threadJson as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Ticket created: ${record.id}`);
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
    query: ListTicketsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.ticket.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TicketWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.raisedByUserId ? { raisedByUserId: query.raisedByUserId } : {}),
      ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { ticketNumber: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
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
    const record = await this.prisma.ticket.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Ticket ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.ticket.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Ticket ${id} not found.`);
      }

      if (dto.ticketNumber && dto.ticketNumber !== existing.ticketNumber) {
        await this.assertTicketNumberUnique(tx, existing.instituteId, dto.ticketNumber, id);
      }

      try {
        return await tx.ticket.update({
          where: { id },
          data: {
            ticketNumber: dto.ticketNumber ?? undefined,
            raisedByUserId: dto.raisedByUserId ?? undefined,
            studentId: dto.studentId !== undefined ? (dto.studentId ?? undefined) : undefined,
            category: dto.category ?? undefined,
            priority: dto.priority !== undefined ? (dto.priority ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            subject: dto.subject ?? undefined,
            description: dto.description ?? undefined,
            assignedToUserId: dto.assignedToUserId !== undefined ? (dto.assignedToUserId ?? undefined) : undefined,
            resolutionText: dto.resolutionText !== undefined ? (dto.resolutionText ?? undefined) : undefined,
            attachmentsJson: dto.attachmentsJson !== undefined ? (dto.attachmentsJson as Prisma.InputJsonValue) : undefined,
            threadJson: dto.threadJson !== undefined ? (dto.threadJson as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.ticket.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.ticket.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Ticket ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertTicketNumberUnique(tx, existing.instituteId, existing.ticketNumber, existing.id);

      return tx.ticket.update({
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

  private async assertTicketNumberUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    ticketNumber: string,
    excludeId?: string,
  ) {
    const clash = await tx.ticket.findFirst({
      where: {
        instituteId,
        ticketNumber,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A Ticket with ticketNumber "${ticketNumber}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Ticket with the same unique fields already exists.',
      );
    }
  }
}
