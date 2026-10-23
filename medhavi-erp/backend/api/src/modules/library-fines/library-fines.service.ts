import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateLibraryFineDto } from './dto/create-library-fine.dto';
import { ListLibraryFinesQueryDto } from './dto/list-library-fines.query';
import { UpdateLibraryFineDto } from './dto/update-library-fine.dto';

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
export class LibraryFinesService {
  private readonly logger = new Logger(LibraryFinesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateLibraryFineDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.libraryFine.create({
          data: {
            instituteId: dto.instituteId,
            bookIssueId: dto.bookIssueId ?? undefined,
            studentId: dto.studentId ?? undefined,
            userId: dto.userId,
            amount: new Prisma.Decimal(dto.amount),
            reason: dto.reason,
            paid: dto.paid ?? undefined,
          },
        });

        this.logger.log(`LibraryFine created: ${record.id}`);
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
    query: ListLibraryFinesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.libraryFine.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.LibraryFineWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(typeof query.paid === 'boolean' ? { paid: query.paid } : {}),
      ...(query.search
        ? { reason: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.libraryFine.count({ where }),
      this.prisma.libraryFine.findMany({
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
    const record = await this.prisma.libraryFine.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`LibraryFine ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateLibraryFineDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.libraryFine.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`LibraryFine ${id} not found.`);
      }



      try {
        return await tx.libraryFine.update({
          where: { id },
          data: {
            bookIssueId: dto.bookIssueId !== undefined ? (dto.bookIssueId ?? undefined) : undefined,
            studentId: dto.studentId !== undefined ? (dto.studentId ?? undefined) : undefined,
            userId: dto.userId ?? undefined,
            amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
            reason: dto.reason ?? undefined,
            paid: dto.paid !== undefined ? (dto.paid ?? undefined) : undefined,
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
    return this.prisma.libraryFine.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.libraryFine.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`LibraryFine ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.libraryFine.update({
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
        'A LibraryFine with the same unique fields already exists.',
      );
    }
  }
}
