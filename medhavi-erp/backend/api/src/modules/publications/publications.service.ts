import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { ListPublicationsQueryDto } from './dto/list-publications.query';
import { UpdatePublicationDto } from './dto/update-publication.dto';

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
export class PublicationsService {
  private readonly logger = new Logger(PublicationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreatePublicationDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.publication.create({
          data: {
            instituteId: dto.instituteId,
            projectId: dto.projectId ?? undefined,
            type: dto.type,
            title: dto.title,
            abstract: dto.abstract ?? undefined,
            authors: dto.authors,
            primaryAuthorFacultyId: dto.primaryAuthorFacultyId ?? undefined,
            venue: dto.venue ?? undefined,
            publisher: dto.publisher ?? undefined,
            doi: dto.doi ?? undefined,
            isbn: dto.isbn ?? undefined,
            issn: dto.issn ?? undefined,
            volume: dto.volume ?? undefined,
            issue: dto.issue ?? undefined,
            pageStart: dto.pageStart ?? undefined,
            pageEnd: dto.pageEnd ?? undefined,
            publishedOn: dto.publishedOn ?? undefined,
            indexingJson: dto.indexingJson !== undefined ? (dto.indexingJson as Prisma.InputJsonValue) : undefined,
            impactFactor: dto.impactFactor !== undefined ? new Prisma.Decimal(dto.impactFactor) : undefined,
            citationCount: dto.citationCount ?? undefined,
            url: dto.url ?? undefined,
            fileObjectId: dto.fileObjectId ?? undefined,
          },
        });

        this.logger.log(`Publication created: ${record.id}`);
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
    query: ListPublicationsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.publication.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.PublicationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.primaryAuthorFacultyId ? { primaryAuthorFacultyId: query.primaryAuthorFacultyId } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.publication.count({ where }),
      this.prisma.publication.findMany({
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
    const record = await this.prisma.publication.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Publication ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdatePublicationDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.publication.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Publication ${id} not found.`);
      }



      try {
        return await tx.publication.update({
          where: { id },
          data: {
            projectId: dto.projectId !== undefined ? (dto.projectId ?? undefined) : undefined,
            type: dto.type ?? undefined,
            title: dto.title ?? undefined,
            abstract: dto.abstract !== undefined ? (dto.abstract ?? undefined) : undefined,
            authors: dto.authors ?? undefined,
            primaryAuthorFacultyId: dto.primaryAuthorFacultyId !== undefined ? (dto.primaryAuthorFacultyId ?? undefined) : undefined,
            venue: dto.venue !== undefined ? (dto.venue ?? undefined) : undefined,
            publisher: dto.publisher !== undefined ? (dto.publisher ?? undefined) : undefined,
            doi: dto.doi !== undefined ? (dto.doi ?? undefined) : undefined,
            isbn: dto.isbn !== undefined ? (dto.isbn ?? undefined) : undefined,
            issn: dto.issn !== undefined ? (dto.issn ?? undefined) : undefined,
            volume: dto.volume !== undefined ? (dto.volume ?? undefined) : undefined,
            issue: dto.issue !== undefined ? (dto.issue ?? undefined) : undefined,
            pageStart: dto.pageStart !== undefined ? (dto.pageStart ?? undefined) : undefined,
            pageEnd: dto.pageEnd !== undefined ? (dto.pageEnd ?? undefined) : undefined,
            publishedOn: dto.publishedOn !== undefined ? (dto.publishedOn ?? undefined) : undefined,
            indexingJson: dto.indexingJson !== undefined ? (dto.indexingJson as Prisma.InputJsonValue) : undefined,
            impactFactor: dto.impactFactor !== undefined ? new Prisma.Decimal(dto.impactFactor) : undefined,
            citationCount: dto.citationCount !== undefined ? (dto.citationCount ?? undefined) : undefined,
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
    return this.prisma.publication.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.publication.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Publication ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.publication.update({
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
        'A Publication with the same unique fields already exists.',
      );
    }
  }
}
