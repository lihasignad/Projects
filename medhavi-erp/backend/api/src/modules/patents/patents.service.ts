import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePatentDto } from './dto/create-patent.dto';
import { ListPatentsQueryDto } from './dto/list-patents.query';
import { UpdatePatentDto } from './dto/update-patent.dto';

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
export class PatentsService {
  private readonly logger = new Logger(PatentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreatePatentDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.patent.create({
          data: {
            instituteId: dto.instituteId,
            projectId: dto.projectId ?? undefined,
            title: dto.title,
            abstract: dto.abstract ?? undefined,
            inventors: dto.inventors ?? undefined,
            primaryInventorFacultyId: dto.primaryInventorFacultyId ?? undefined,
            applicationNumber: dto.applicationNumber ?? undefined,
            patentNumber: dto.patentNumber ?? undefined,
            status: dto.status ?? undefined,
            jurisdiction: dto.jurisdiction ?? undefined,
            filedOn: dto.filedOn ?? undefined,
            publishedOn: dto.publishedOn ?? undefined,
            grantedOn: dto.grantedOn ?? undefined,
            expiresOn: dto.expiresOn ?? undefined,
            classification: dto.classification ?? undefined,
            url: dto.url ?? undefined,
            fileObjectId: dto.fileObjectId ?? undefined,
          },
        });

        this.logger.log(`Patent created: ${record.id}`);
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
    query: ListPatentsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.patent.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.PatentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.primaryInventorFacultyId ? { primaryInventorFacultyId: query.primaryInventorFacultyId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { applicationNumber: { contains: query.search, mode: 'insensitive' } },
              { patentNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.patent.count({ where }),
      this.prisma.patent.findMany({
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
    const record = await this.prisma.patent.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Patent ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdatePatentDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.patent.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Patent ${id} not found.`);
      }



      try {
        return await tx.patent.update({
          where: { id },
          data: {
            projectId: dto.projectId !== undefined ? (dto.projectId ?? undefined) : undefined,
            title: dto.title ?? undefined,
            abstract: dto.abstract !== undefined ? (dto.abstract ?? undefined) : undefined,
            inventors: dto.inventors !== undefined ? (dto.inventors ?? undefined) : undefined,
            primaryInventorFacultyId: dto.primaryInventorFacultyId !== undefined ? (dto.primaryInventorFacultyId ?? undefined) : undefined,
            applicationNumber: dto.applicationNumber !== undefined ? (dto.applicationNumber ?? undefined) : undefined,
            patentNumber: dto.patentNumber !== undefined ? (dto.patentNumber ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            jurisdiction: dto.jurisdiction !== undefined ? (dto.jurisdiction ?? undefined) : undefined,
            filedOn: dto.filedOn !== undefined ? (dto.filedOn ?? undefined) : undefined,
            publishedOn: dto.publishedOn !== undefined ? (dto.publishedOn ?? undefined) : undefined,
            grantedOn: dto.grantedOn !== undefined ? (dto.grantedOn ?? undefined) : undefined,
            expiresOn: dto.expiresOn !== undefined ? (dto.expiresOn ?? undefined) : undefined,
            classification: dto.classification !== undefined ? (dto.classification ?? undefined) : undefined,
            url: dto.url !== undefined ? (dto.url ?? undefined) : undefined,
            fileObjectId: dto.fileObjectId !== undefined ? (dto.fileObjectId ?? undefined) : undefined,
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
    return this.prisma.patent.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.patent.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Patent ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.patent.update({
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
        'A Patent with the same unique fields already exists.',
      );
    }
  }
}
