import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTransportPassDto } from './dto/create-transport-pass.dto';
import { ListTransportPassesQueryDto } from './dto/list-transport-passes.query';
import { UpdateTransportPassDto } from './dto/update-transport-pass.dto';

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
export class TransportPassesService {
  private readonly logger = new Logger(TransportPassesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateTransportPassDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertPassNumberUnique(tx, dto.instituteId, dto.passNumber);

      try {
        const record = await tx.transportPass.create({
          data: {
            instituteId: dto.instituteId,
            studentId: dto.studentId,
            routeId: dto.routeId,
            stopId: dto.stopId ?? undefined,
            academicYearId: dto.academicYearId,
            passNumber: dto.passNumber,
            validFrom: dto.validFrom,
            validTo: dto.validTo,
            status: dto.status ?? undefined,
            feePaid: dto.feePaid ?? undefined,
          },
        });

        this.logger.log(`TransportPass created: ${record.id}`);
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
    query: ListTransportPassesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.transportPass.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TransportPassWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.routeId ? { routeId: query.routeId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { passNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.transportPass.count({ where }),
      this.prisma.transportPass.findMany({
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
    const record = await this.prisma.transportPass.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`TransportPass ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateTransportPassDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportPass.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`TransportPass ${id} not found.`);
      }

      if (dto.passNumber && dto.passNumber !== existing.passNumber) {
        await this.assertPassNumberUnique(tx, existing.instituteId, dto.passNumber, id);
      }

      try {
        return await tx.transportPass.update({
          where: { id },
          data: {
            studentId: dto.studentId ?? undefined,
            routeId: dto.routeId ?? undefined,
            stopId: dto.stopId !== undefined ? (dto.stopId ?? undefined) : undefined,
            academicYearId: dto.academicYearId ?? undefined,
            passNumber: dto.passNumber ?? undefined,
            validFrom: dto.validFrom ?? undefined,
            validTo: dto.validTo ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            feePaid: dto.feePaid !== undefined ? (dto.feePaid ?? undefined) : undefined,
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
    return this.prisma.transportPass.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportPass.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`TransportPass ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertPassNumberUnique(tx, existing.instituteId, existing.passNumber, existing.id);

      return tx.transportPass.update({
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

  private async assertPassNumberUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    passNumber: string,
    excludeId?: string,
  ) {
    const clash = await tx.transportPass.findFirst({
      where: {
        instituteId,
        passNumber,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A TransportPass with passNumber "${passNumber}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A TransportPass with the same unique fields already exists.',
      );
    }
  }
}
