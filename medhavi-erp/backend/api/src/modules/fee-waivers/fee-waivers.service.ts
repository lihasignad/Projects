import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFeeWaiverDto } from './dto/create-fee-waiver.dto';
import { ListFeeWaiversQueryDto } from './dto/list-fee-waivers.query';
import { UpdateFeeWaiverDto } from './dto/update-fee-waiver.dto';

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
export class FeeWaiversService {
  private readonly logger = new Logger(FeeWaiversService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateFeeWaiverDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.feeWaiver.create({
          data: {
            instituteId: dto.instituteId,
            studentId: dto.studentId,
            invoiceId: dto.invoiceId ?? undefined,
            amount: new Prisma.Decimal(dto.amount),
            reason: dto.reason,
            status: dto.status ?? undefined,
            requestedByUserId: dto.requestedByUserId,
            approvedByUserId: dto.approvedByUserId ?? undefined,
            approvedAt: dto.approvedAt ?? undefined,
            remarks: dto.remarks ?? undefined,
          },
        });

        this.logger.log(`FeeWaiver created: ${record.id}`);
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
    query: ListFeeWaiversQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.feeWaiver.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.FeeWaiverWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { reason: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.feeWaiver.count({ where }),
      this.prisma.feeWaiver.findMany({
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
    const record = await this.prisma.feeWaiver.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`FeeWaiver ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateFeeWaiverDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feeWaiver.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`FeeWaiver ${id} not found.`);
      }



      try {
        return await tx.feeWaiver.update({
          where: { id },
          data: {
            studentId: dto.studentId ?? undefined,
            invoiceId: dto.invoiceId !== undefined ? (dto.invoiceId ?? undefined) : undefined,
            amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
            reason: dto.reason ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            requestedByUserId: dto.requestedByUserId ?? undefined,
            approvedByUserId: dto.approvedByUserId !== undefined ? (dto.approvedByUserId ?? undefined) : undefined,
            approvedAt: dto.approvedAt !== undefined ? (dto.approvedAt ?? undefined) : undefined,
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
    return this.prisma.feeWaiver.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feeWaiver.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`FeeWaiver ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.feeWaiver.update({
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
        'A FeeWaiver with the same unique fields already exists.',
      );
    }
  }
}
