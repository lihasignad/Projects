import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { ListBookCopiesQueryDto } from './dto/list-book-copies.query';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';

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
export class BookCopiesService {
  private readonly logger = new Logger(BookCopiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateBookCopyDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertAccessionNoUnique(tx, dto.instituteId, dto.accessionNo);

      try {
        const record = await tx.bookCopy.create({
          data: {
            instituteId: dto.instituteId,
            bookId: dto.bookId,
            accessionNo: dto.accessionNo,
            shelfLocation: dto.shelfLocation ?? undefined,
            acquiredOn: dto.acquiredOn ?? undefined,
            price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
            status: dto.status ?? undefined,
            notes: dto.notes ?? undefined,
          },
        });

        this.logger.log(`BookCopy created: ${record.id}`);
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
    query: ListBookCopiesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.bookCopy.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'accessionNo';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.BookCopyWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.bookId ? { bookId: query.bookId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { accessionNo: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.bookCopy.count({ where }),
      this.prisma.bookCopy.findMany({
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
    const record = await this.prisma.bookCopy.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`BookCopy ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateBookCopyDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookCopy.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`BookCopy ${id} not found.`);
      }

      if (dto.accessionNo && dto.accessionNo !== existing.accessionNo) {
        await this.assertAccessionNoUnique(tx, existing.instituteId, dto.accessionNo, id);
      }

      try {
        return await tx.bookCopy.update({
          where: { id },
          data: {
            bookId: dto.bookId ?? undefined,
            accessionNo: dto.accessionNo ?? undefined,
            shelfLocation: dto.shelfLocation !== undefined ? (dto.shelfLocation ?? undefined) : undefined,
            acquiredOn: dto.acquiredOn !== undefined ? (dto.acquiredOn ?? undefined) : undefined,
            price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
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
    return this.prisma.bookCopy.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookCopy.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`BookCopy ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertAccessionNoUnique(tx, existing.instituteId, existing.accessionNo, existing.id);

      return tx.bookCopy.update({
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

  private async assertAccessionNoUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    accessionNo: string,
    excludeId?: string,
  ) {
    const clash = await tx.bookCopy.findFirst({
      where: {
        instituteId,
        accessionNo,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A BookCopy with accessionNo "${accessionNo}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A BookCopy with the same unique fields already exists.',
      );
    }
  }
}
