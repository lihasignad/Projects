import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.query';
import { UpdatePaymentDto } from './dto/update-payment.dto';

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
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertPaymentNumberUnique(tx, dto.instituteId, dto.paymentNumber);

      try {
        const record = await tx.payment.create({
          data: {
            instituteId: dto.instituteId,
            invoiceId: dto.invoiceId ?? undefined,
            studentId: dto.studentId,
            paymentNumber: dto.paymentNumber,
            method: dto.method,
            status: dto.status ?? undefined,
            amount: new Prisma.Decimal(dto.amount),
            currency: dto.currency ?? undefined,
            gatewayName: dto.gatewayName ?? undefined,
            gatewayTxnId: dto.gatewayTxnId ?? undefined,
            gatewayResponse: dto.gatewayResponse !== undefined ? (dto.gatewayResponse as Prisma.InputJsonValue) : undefined,
            paidAt: dto.paidAt ?? undefined,
            refundedAt: dto.refundedAt ?? undefined,
            refundAmount: dto.refundAmount !== undefined ? new Prisma.Decimal(dto.refundAmount) : undefined,
            receiptUrl: dto.receiptUrl ?? undefined,
            receivedByUserId: dto.receivedByUserId ?? undefined,
            notes: dto.notes ?? undefined,
          },
        });

        this.logger.log(`Payment created: ${record.id}`);
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
    query: ListPaymentsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.payment.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.PaymentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.invoiceId ? { invoiceId: query.invoiceId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.method ? { method: query.method } : {}),
      ...(query.search
        ? { paymentNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
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
    const record = await this.prisma.payment.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Payment ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Payment ${id} not found.`);
      }

      if (dto.paymentNumber && dto.paymentNumber !== existing.paymentNumber) {
        await this.assertPaymentNumberUnique(tx, existing.instituteId, dto.paymentNumber, id);
      }

      try {
        return await tx.payment.update({
          where: { id },
          data: {
            invoiceId: dto.invoiceId !== undefined ? (dto.invoiceId ?? undefined) : undefined,
            studentId: dto.studentId ?? undefined,
            paymentNumber: dto.paymentNumber ?? undefined,
            method: dto.method ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            gatewayName: dto.gatewayName !== undefined ? (dto.gatewayName ?? undefined) : undefined,
            gatewayTxnId: dto.gatewayTxnId !== undefined ? (dto.gatewayTxnId ?? undefined) : undefined,
            gatewayResponse: dto.gatewayResponse !== undefined ? (dto.gatewayResponse as Prisma.InputJsonValue) : undefined,
            paidAt: dto.paidAt !== undefined ? (dto.paidAt ?? undefined) : undefined,
            refundedAt: dto.refundedAt !== undefined ? (dto.refundedAt ?? undefined) : undefined,
            refundAmount: dto.refundAmount !== undefined ? new Prisma.Decimal(dto.refundAmount) : undefined,
            receiptUrl: dto.receiptUrl !== undefined ? (dto.receiptUrl ?? undefined) : undefined,
            receivedByUserId: dto.receivedByUserId !== undefined ? (dto.receivedByUserId ?? undefined) : undefined,
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
    return this.prisma.payment.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Payment ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertPaymentNumberUnique(tx, existing.instituteId, existing.paymentNumber, existing.id);

      return tx.payment.update({
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

  private async assertPaymentNumberUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    paymentNumber: string,
    excludeId?: string,
  ) {
    const clash = await tx.payment.findFirst({
      where: {
        instituteId,
        paymentNumber,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A Payment with paymentNumber "${paymentNumber}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Payment with the same unique fields already exists.',
      );
    }
  }
}
