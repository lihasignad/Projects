import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { ListScholarshipsQueryDto } from './dto/list-scholarships.query';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';

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
export class ScholarshipsService {
  private readonly logger = new Logger(ScholarshipsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateScholarshipDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.scholarship.create({
          data: {
            instituteId: dto.instituteId,
            studentId: dto.studentId,
            academicYearId: dto.academicYearId,
            name: dto.name,
            sponsor: dto.sponsor ?? undefined,
            amount: new Prisma.Decimal(dto.amount),
            currency: dto.currency ?? undefined,
            status: dto.status ?? undefined,
            disbursementMethod: dto.disbursementMethod ?? undefined,
            documentsJson: dto.documentsJson !== undefined ? (dto.documentsJson as Prisma.InputJsonValue) : undefined,
            remarks: dto.remarks ?? undefined,
          },
        });

        this.logger.log(`Scholarship created: ${record.id}`);
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
    query: ListScholarshipsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.scholarship.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.ScholarshipWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.scholarship.count({ where }),
      this.prisma.scholarship.findMany({
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
    const record = await this.prisma.scholarship.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Scholarship ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateScholarshipDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.scholarship.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Scholarship ${id} not found.`);
      }



      try {
        return await tx.scholarship.update({
          where: { id },
          data: {
            studentId: dto.studentId ?? undefined,
            academicYearId: dto.academicYearId ?? undefined,
            name: dto.name ?? undefined,
            sponsor: dto.sponsor !== undefined ? (dto.sponsor ?? undefined) : undefined,
            amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            disbursementMethod: dto.disbursementMethod !== undefined ? (dto.disbursementMethod ?? undefined) : undefined,
            documentsJson: dto.documentsJson !== undefined ? (dto.documentsJson as Prisma.InputJsonValue) : undefined,
            remarks: dto.remarks !== undefined ? (dto.remarks ?? undefined) : undefined,
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
    return this.prisma.scholarship.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.scholarship.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Scholarship ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.scholarship.update({
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
        'A Scholarship with the same unique fields already exists.',
      );
    }
  }
}
