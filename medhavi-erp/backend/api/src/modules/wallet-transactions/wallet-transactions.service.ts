import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { ListWalletTransactionsQueryDto } from './dto/list-wallet-transactions.query';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';

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
export class WalletTransactionsService {
  private readonly logger = new Logger(WalletTransactionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateWalletTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.walletTransaction.create({
          data: {
            instituteId: dto.instituteId,
            walletId: dto.walletId,
            paymentId: dto.paymentId ?? undefined,
            type: dto.type,
            amount: new Prisma.Decimal(dto.amount),
            balanceAfter: new Prisma.Decimal(dto.balanceAfter),
            reference: dto.reference ?? undefined,
            description: dto.description ?? undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
            createdByUserId: dto.createdByUserId ?? undefined,
          },
        });

        this.logger.log(`WalletTransaction created: ${record.id}`);
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
    query: ListWalletTransactionsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.walletTransaction.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.WalletTransactionWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.walletId ? { walletId: query.walletId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.search
        ? { reference: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.walletTransaction.count({ where }),
      this.prisma.walletTransaction.findMany({
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
    const record = await this.prisma.walletTransaction.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`WalletTransaction ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateWalletTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`WalletTransaction ${id} not found.`);
      }



      try {
        return await tx.walletTransaction.update({
          where: { id },
          data: {
            walletId: dto.walletId ?? undefined,
            paymentId: dto.paymentId !== undefined ? (dto.paymentId ?? undefined) : undefined,
            type: dto.type ?? undefined,
            amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
            balanceAfter: dto.balanceAfter !== undefined ? new Prisma.Decimal(dto.balanceAfter) : undefined,
            reference: dto.reference !== undefined ? (dto.reference ?? undefined) : undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
            createdByUserId: dto.createdByUserId !== undefined ? (dto.createdByUserId ?? undefined) : undefined,
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
    return this.prisma.walletTransaction.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`WalletTransaction ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.walletTransaction.update({
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
        'A WalletTransaction with the same unique fields already exists.',
      );
    }
  }
}
