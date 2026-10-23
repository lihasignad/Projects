import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesQueryDto } from './dto/list-companies.query';
import { UpdateCompanyDto } from './dto/update-company.dto';

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
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateCompanyDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertNameUnique(tx, dto.instituteId, dto.name);

      try {
        const record = await tx.company.create({
          data: {
            instituteId: dto.instituteId,
            name: dto.name,
            legalName: dto.legalName ?? undefined,
            website: dto.website ?? undefined,
            industry: dto.industry ?? undefined,
            size: dto.size ?? undefined,
            hqLocation: dto.hqLocation ?? undefined,
            description: dto.description ?? undefined,
            logoUrl: dto.logoUrl ?? undefined,
            status: dto.status ?? undefined,
            primaryContactName: dto.primaryContactName ?? undefined,
            primaryContactEmail: dto.primaryContactEmail ?? undefined,
            primaryContactPhone: dto.primaryContactPhone ?? undefined,
            mouSignedAt: dto.mouSignedAt ?? undefined,
            blacklistReason: dto.blacklistReason ?? undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Company created: ${record.id}`);
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
    query: ListCompaniesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.company.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.CompanyWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.industry ? { industry: query.industry } : {}),
      ...(query.size ? { size: query.size } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
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
    const record = await this.prisma.company.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Company ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateCompanyDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.company.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Company ${id} not found.`);
      }

      if (dto.name && dto.name !== existing.name) {
        await this.assertNameUnique(tx, existing.instituteId, dto.name, id);
      }

      try {
        return await tx.company.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            legalName: dto.legalName !== undefined ? (dto.legalName ?? undefined) : undefined,
            website: dto.website !== undefined ? (dto.website ?? undefined) : undefined,
            industry: dto.industry !== undefined ? (dto.industry ?? undefined) : undefined,
            size: dto.size !== undefined ? (dto.size ?? undefined) : undefined,
            hqLocation: dto.hqLocation !== undefined ? (dto.hqLocation ?? undefined) : undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            logoUrl: dto.logoUrl !== undefined ? (dto.logoUrl ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            primaryContactName: dto.primaryContactName !== undefined ? (dto.primaryContactName ?? undefined) : undefined,
            primaryContactEmail: dto.primaryContactEmail !== undefined ? (dto.primaryContactEmail ?? undefined) : undefined,
            primaryContactPhone: dto.primaryContactPhone !== undefined ? (dto.primaryContactPhone ?? undefined) : undefined,
            mouSignedAt: dto.mouSignedAt !== undefined ? (dto.mouSignedAt ?? undefined) : undefined,
            blacklistReason: dto.blacklistReason !== undefined ? (dto.blacklistReason ?? undefined) : undefined,
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
    return this.prisma.company.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.company.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Company ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertNameUnique(tx, existing.instituteId, existing.name, existing.id);

      return tx.company.update({
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

  private async assertNameUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    name: string,
    excludeId?: string,
  ) {
    const clash = await tx.company.findFirst({
      where: {
        instituteId,
        name,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A Company with name "${name}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Company with the same unique fields already exists.',
      );
    }
  }
}
