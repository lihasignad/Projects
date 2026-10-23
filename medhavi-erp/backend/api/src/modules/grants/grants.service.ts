import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateGrantDto } from './dto/create-grant.dto';
import { ListGrantsQueryDto } from './dto/list-grants.query';
import { UpdateGrantDto } from './dto/update-grant.dto';

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
export class GrantsService {
  private readonly logger = new Logger(GrantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateGrantDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.grant.create({
          data: {
            instituteId: dto.instituteId,
            projectId: dto.projectId ?? undefined,
            title: dto.title,
            fundingAgency: dto.fundingAgency,
            schemeName: dto.schemeName ?? undefined,
            amountSanctioned: dto.amountSanctioned !== undefined ? new Prisma.Decimal(dto.amountSanctioned) : undefined,
            amountReleased: dto.amountReleased !== undefined ? new Prisma.Decimal(dto.amountReleased) : undefined,
            currency: dto.currency ?? undefined,
            status: dto.status ?? undefined,
            appliedOn: dto.appliedOn ?? undefined,
            sanctionedOn: dto.sanctionedOn ?? undefined,
            startDate: dto.startDate ?? undefined,
            endDate: dto.endDate ?? undefined,
            pifacultyId: dto.pifacultyId,
            coPis: dto.coPis ?? undefined,
            referenceNumber: dto.referenceNumber ?? undefined,
            documentsJson: dto.documentsJson !== undefined ? (dto.documentsJson as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Grant created: ${record.id}`);
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
    query: ListGrantsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.grant.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.GrantWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.pifacultyId ? { pifacultyId: query.pifacultyId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { fundingAgency: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.grant.count({ where }),
      this.prisma.grant.findMany({
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
    const record = await this.prisma.grant.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Grant ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateGrantDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.grant.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Grant ${id} not found.`);
      }



      try {
        return await tx.grant.update({
          where: { id },
          data: {
            projectId: dto.projectId !== undefined ? (dto.projectId ?? undefined) : undefined,
            title: dto.title ?? undefined,
            fundingAgency: dto.fundingAgency ?? undefined,
            schemeName: dto.schemeName !== undefined ? (dto.schemeName ?? undefined) : undefined,
            amountSanctioned: dto.amountSanctioned !== undefined ? new Prisma.Decimal(dto.amountSanctioned) : undefined,
            amountReleased: dto.amountReleased !== undefined ? new Prisma.Decimal(dto.amountReleased) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            appliedOn: dto.appliedOn !== undefined ? (dto.appliedOn ?? undefined) : undefined,
            sanctionedOn: dto.sanctionedOn !== undefined ? (dto.sanctionedOn ?? undefined) : undefined,
            startDate: dto.startDate !== undefined ? (dto.startDate ?? undefined) : undefined,
            endDate: dto.endDate !== undefined ? (dto.endDate ?? undefined) : undefined,
            pifacultyId: dto.pifacultyId ?? undefined,
            coPis: dto.coPis !== undefined ? (dto.coPis ?? undefined) : undefined,
            referenceNumber: dto.referenceNumber !== undefined ? (dto.referenceNumber ?? undefined) : undefined,
            documentsJson: dto.documentsJson !== undefined ? (dto.documentsJson as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.grant.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.grant.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Grant ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.grant.update({
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
        'A Grant with the same unique fields already exists.',
      );
    }
  }
}
