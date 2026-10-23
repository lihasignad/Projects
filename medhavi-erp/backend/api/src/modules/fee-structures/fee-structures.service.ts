import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { ListFeeStructuresQueryDto } from './dto/list-fee-structures.query';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';

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
export class FeeStructuresService {
  private readonly logger = new Logger(FeeStructuresService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateFeeStructureDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.feeStructure.create({
          data: {
            instituteId: dto.instituteId,
            programId: dto.programId ?? undefined,
            batchId: dto.batchId ?? undefined,
            academicYearId: dto.academicYearId,
            termId: dto.termId ?? undefined,
            name: dto.name,
            description: dto.description ?? undefined,
            totalAmount: new Prisma.Decimal(dto.totalAmount),
            currency: dto.currency ?? undefined,
            componentsJson: dto.componentsJson as Prisma.InputJsonValue,
            dueDate: dto.dueDate ?? undefined,
            status: dto.status ?? undefined,
            effectiveFrom: dto.effectiveFrom,
            effectiveTo: dto.effectiveTo ?? undefined,
          },
        });

        this.logger.log(`FeeStructure created: ${record.id}`);
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
    query: ListFeeStructuresQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.feeStructure.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.FeeStructureWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.programId ? { programId: query.programId } : {}),
      ...(query.batchId ? { batchId: query.batchId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.feeStructure.count({ where }),
      this.prisma.feeStructure.findMany({
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
    const record = await this.prisma.feeStructure.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`FeeStructure ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateFeeStructureDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feeStructure.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`FeeStructure ${id} not found.`);
      }



      try {
        return await tx.feeStructure.update({
          where: { id },
          data: {
            programId: dto.programId !== undefined ? (dto.programId ?? undefined) : undefined,
            batchId: dto.batchId !== undefined ? (dto.batchId ?? undefined) : undefined,
            academicYearId: dto.academicYearId ?? undefined,
            termId: dto.termId !== undefined ? (dto.termId ?? undefined) : undefined,
            name: dto.name ?? undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            totalAmount: dto.totalAmount !== undefined ? new Prisma.Decimal(dto.totalAmount) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            componentsJson: dto.componentsJson !== undefined ? (dto.componentsJson as Prisma.InputJsonValue) : undefined,
            dueDate: dto.dueDate !== undefined ? (dto.dueDate ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            effectiveFrom: dto.effectiveFrom ?? undefined,
            effectiveTo: dto.effectiveTo !== undefined ? (dto.effectiveTo ?? undefined) : undefined,
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
    return this.prisma.feeStructure.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feeStructure.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`FeeStructure ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.feeStructure.update({
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
        'A FeeStructure with the same unique fields already exists.',
      );
    }
  }
}
