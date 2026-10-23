import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBookIssueDto } from './dto/create-book-issue.dto';
import { ListBookIssuesQueryDto } from './dto/list-book-issues.query';
import { UpdateBookIssueDto } from './dto/update-book-issue.dto';

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
export class BookIssuesService {
  private readonly logger = new Logger(BookIssuesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateBookIssueDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.bookIssue.create({
          data: {
            instituteId: dto.instituteId,
            bookCopyId: dto.bookCopyId,
            studentId: dto.studentId ?? undefined,
            borrowerUserId: dto.borrowerUserId,
            dueAt: dto.dueAt,
            status: dto.status ?? undefined,
            issuedByUserId: dto.issuedByUserId,
            notes: dto.notes ?? undefined,
          },
        });

        this.logger.log(`BookIssue created: ${record.id}`);
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
    query: ListBookIssuesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.bookIssue.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.BookIssueWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.bookCopyId ? { bookCopyId: query.bookCopyId } : {}),
      ...(query.borrowerUserId ? { borrowerUserId: query.borrowerUserId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),

    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.bookIssue.count({ where }),
      this.prisma.bookIssue.findMany({
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
    const record = await this.prisma.bookIssue.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`BookIssue ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateBookIssueDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookIssue.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`BookIssue ${id} not found.`);
      }



      try {
        return await tx.bookIssue.update({
          where: { id },
          data: {
            bookCopyId: dto.bookCopyId ?? undefined,
            studentId: dto.studentId !== undefined ? (dto.studentId ?? undefined) : undefined,
            borrowerUserId: dto.borrowerUserId ?? undefined,
            dueAt: dto.dueAt ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            issuedByUserId: dto.issuedByUserId ?? undefined,
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
    return this.prisma.bookIssue.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookIssue.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`BookIssue ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.bookIssue.update({
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
        'A BookIssue with the same unique fields already exists.',
      );
    }
  }
}
