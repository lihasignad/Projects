import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBookReservationDto } from './dto/create-book-reservation.dto';
import { ListBookReservationsQueryDto } from './dto/list-book-reservations.query';
import { UpdateBookReservationDto } from './dto/update-book-reservation.dto';

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
export class BookReservationsService {
  private readonly logger = new Logger(BookReservationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateBookReservationDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.bookReservation.create({
          data: {
            instituteId: dto.instituteId,
            bookId: dto.bookId,
            studentId: dto.studentId ?? undefined,
            reservedByUserId: dto.reservedByUserId,
            expiresAt: dto.expiresAt,
            status: dto.status ?? undefined,
            queuePosition: dto.queuePosition ?? undefined,
            notes: dto.notes ?? undefined,
          },
        });

        this.logger.log(`BookReservation created: ${record.id}`);
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
    query: ListBookReservationsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.bookReservation.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.BookReservationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.bookId ? { bookId: query.bookId } : {}),
      ...(query.reservedByUserId ? { reservedByUserId: query.reservedByUserId } : {}),
      ...(query.status ? { status: query.status } : {}),

    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.bookReservation.count({ where }),
      this.prisma.bookReservation.findMany({
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
    const record = await this.prisma.bookReservation.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`BookReservation ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateBookReservationDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookReservation.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`BookReservation ${id} not found.`);
      }



      try {
        return await tx.bookReservation.update({
          where: { id },
          data: {
            bookId: dto.bookId ?? undefined,
            studentId: dto.studentId !== undefined ? (dto.studentId ?? undefined) : undefined,
            reservedByUserId: dto.reservedByUserId ?? undefined,
            expiresAt: dto.expiresAt ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            queuePosition: dto.queuePosition !== undefined ? (dto.queuePosition ?? undefined) : undefined,
            notes: dto.notes !== undefined ? (dto.notes ?? undefined) : undefined,
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
    return this.prisma.bookReservation.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookReservation.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`BookReservation ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.bookReservation.update({
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
        'A BookReservation with the same unique fields already exists.',
      );
    }
  }
}
