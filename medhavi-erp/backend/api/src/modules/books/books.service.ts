import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQueryDto } from './dto/list-books.query';
import { UpdateBookDto } from './dto/update-book.dto';

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
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      if (dto.isbn) {
        await this.assertIsbnUnique(tx, dto.instituteId, dto.isbn);
      }

      try {
        const record = await tx.book.create({
          data: {
            instituteId: dto.instituteId,
            isbn: dto.isbn ?? undefined,
            title: dto.title,
            subtitle: dto.subtitle ?? undefined,
            authors: dto.authors ?? undefined,
            publisher: dto.publisher ?? undefined,
            edition: dto.edition ?? undefined,
            publishYear: dto.publishYear ?? undefined,
            language: dto.language ?? undefined,
            category: dto.category ?? undefined,
            subjects: dto.subjects ?? undefined,
            description: dto.description ?? undefined,
            coverUrl: dto.coverUrl ?? undefined,
            totalCopies: dto.totalCopies ?? undefined,
            availableCopies: dto.availableCopies ?? undefined,
          },
        });

        this.logger.log(`Book created: ${record.id}`);
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
    query: ListBooksQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.book.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'title';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.BookWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.language ? { language: query.language } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { isbn: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
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
    const record = await this.prisma.book.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Book ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.book.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Book ${id} not found.`);
      }

      if (dto.isbn && dto.isbn !== existing.isbn) {
        await this.assertIsbnUnique(tx, existing.instituteId, dto.isbn, id);
      }

      try {
        return await tx.book.update({
          where: { id },
          data: {
            isbn: dto.isbn !== undefined ? (dto.isbn ?? undefined) : undefined,
            title: dto.title ?? undefined,
            subtitle: dto.subtitle !== undefined ? (dto.subtitle ?? undefined) : undefined,
            authors: dto.authors !== undefined ? (dto.authors ?? undefined) : undefined,
            publisher: dto.publisher !== undefined ? (dto.publisher ?? undefined) : undefined,
            edition: dto.edition !== undefined ? (dto.edition ?? undefined) : undefined,
            publishYear: dto.publishYear !== undefined ? (dto.publishYear ?? undefined) : undefined,
            language: dto.language !== undefined ? (dto.language ?? undefined) : undefined,
            category: dto.category !== undefined ? (dto.category ?? undefined) : undefined,
            subjects: dto.subjects !== undefined ? (dto.subjects ?? undefined) : undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            coverUrl: dto.coverUrl !== undefined ? (dto.coverUrl ?? undefined) : undefined,
            totalCopies: dto.totalCopies !== undefined ? (dto.totalCopies ?? undefined) : undefined,
            availableCopies: dto.availableCopies !== undefined ? (dto.availableCopies ?? undefined) : undefined,
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
    return this.prisma.book.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.book.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Book ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      if (existing.isbn) {
        await this.assertIsbnUnique(tx, existing.instituteId, existing.isbn, existing.id);
      }

      return tx.book.update({
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

  private async assertIsbnUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    isbn: string,
    excludeId?: string,
  ) {
    const clash = await tx.book.findFirst({
      where: {
        instituteId,
        isbn,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A Book with isbn "${isbn}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Book with the same unique fields already exists.',
      );
    }
  }
}
