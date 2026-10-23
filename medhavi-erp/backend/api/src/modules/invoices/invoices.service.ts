import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ListInvoicesQueryDto } from './dto/list-invoices.query';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

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
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertInvoiceNumberUnique(tx, dto.instituteId, dto.invoiceNumber);

      try {
        const record = await tx.invoice.create({
          data: {
            instituteId: dto.instituteId,
            studentId: dto.studentId,
            feeStructureId: dto.feeStructureId ?? undefined,
            termId: dto.termId ?? undefined,
            invoiceNumber: dto.invoiceNumber,
            status: dto.status ?? undefined,
            subTotal: new Prisma.Decimal(dto.subTotal),
            discountTotal: dto.discountTotal !== undefined ? new Prisma.Decimal(dto.discountTotal) : undefined,
            taxTotal: dto.taxTotal !== undefined ? new Prisma.Decimal(dto.taxTotal) : undefined,
            grandTotal: new Prisma.Decimal(dto.grandTotal),
            amountPaid: dto.amountPaid !== undefined ? new Prisma.Decimal(dto.amountPaid) : undefined,
            amountDue: new Prisma.Decimal(dto.amountDue),
            currency: dto.currency ?? undefined,
            issuedAt: dto.issuedAt ?? undefined,
            dueDate: dto.dueDate ?? undefined,
            lineItemsJson: dto.lineItemsJson as Prisma.InputJsonValue,
            notes: dto.notes ?? undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Invoice created: ${record.id}`);
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
    query: ListInvoicesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.invoice.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.InvoiceWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { invoiceNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
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
    const record = await this.prisma.invoice.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Invoice ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Invoice ${id} not found.`);
      }

      if (dto.invoiceNumber && dto.invoiceNumber !== existing.invoiceNumber) {
        await this.assertInvoiceNumberUnique(tx, existing.instituteId, dto.invoiceNumber, id);
      }

      try {
        return await tx.invoice.update({
          where: { id },
          data: {
            studentId: dto.studentId ?? undefined,
            feeStructureId: dto.feeStructureId !== undefined ? (dto.feeStructureId ?? undefined) : undefined,
            termId: dto.termId !== undefined ? (dto.termId ?? undefined) : undefined,
            invoiceNumber: dto.invoiceNumber ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            subTotal: dto.subTotal !== undefined ? new Prisma.Decimal(dto.subTotal) : undefined,
            discountTotal: dto.discountTotal !== undefined ? new Prisma.Decimal(dto.discountTotal) : undefined,
            taxTotal: dto.taxTotal !== undefined ? new Prisma.Decimal(dto.taxTotal) : undefined,
            grandTotal: dto.grandTotal !== undefined ? new Prisma.Decimal(dto.grandTotal) : undefined,
            amountPaid: dto.amountPaid !== undefined ? new Prisma.Decimal(dto.amountPaid) : undefined,
            amountDue: dto.amountDue !== undefined ? new Prisma.Decimal(dto.amountDue) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            issuedAt: dto.issuedAt !== undefined ? (dto.issuedAt ?? undefined) : undefined,
            dueDate: dto.dueDate !== undefined ? (dto.dueDate ?? undefined) : undefined,
            lineItemsJson: dto.lineItemsJson !== undefined ? (dto.lineItemsJson as Prisma.InputJsonValue) : undefined,
            notes: dto.notes !== undefined ? (dto.notes ?? undefined) : undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.invoice.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Invoice ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertInvoiceNumberUnique(tx, existing.instituteId, existing.invoiceNumber, existing.id);

      return tx.invoice.update({
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

  private async assertInvoiceNumberUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    invoiceNumber: string,
    excludeId?: string,
  ) {
    const clash = await tx.invoice.findFirst({
      where: {
        instituteId,
        invoiceNumber,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A Invoice with invoiceNumber "${invoiceNumber}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Invoice with the same unique fields already exists.',
      );
    }
  }
}
