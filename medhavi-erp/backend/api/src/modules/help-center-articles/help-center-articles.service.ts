import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateHelpCenterArticleDto } from './dto/create-help-center-article.dto';
import { ListHelpCenterArticlesQueryDto } from './dto/list-help-center-articles.query';
import { UpdateHelpCenterArticleDto } from './dto/update-help-center-article.dto';

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
export class HelpCenterArticlesService {
  private readonly logger = new Logger(HelpCenterArticlesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateHelpCenterArticleDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertSlugUnique(tx, dto.instituteId, dto.slug);

      try {
        const record = await tx.helpCenterArticle.create({
          data: {
            instituteId: dto.instituteId,
            category: dto.category,
            slug: dto.slug,
            title: dto.title,
            bodyMarkdown: dto.bodyMarkdown,
            tags: dto.tags ?? undefined,
            isPublished: dto.isPublished ?? undefined,
            authorUserId: dto.authorUserId ?? undefined,
          },
        });

        this.logger.log(`HelpCenterArticle created: ${record.id}`);
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
    query: ListHelpCenterArticlesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.helpCenterArticle.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.HelpCenterArticleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(typeof query.isPublished === 'boolean' ? { isPublished: query.isPublished } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.helpCenterArticle.count({ where }),
      this.prisma.helpCenterArticle.findMany({
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
    const record = await this.prisma.helpCenterArticle.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`HelpCenterArticle ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateHelpCenterArticleDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.helpCenterArticle.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`HelpCenterArticle ${id} not found.`);
      }

      if (dto.slug && dto.slug !== existing.slug) {
        await this.assertSlugUnique(tx, existing.instituteId, dto.slug, id);
      }

      try {
        return await tx.helpCenterArticle.update({
          where: { id },
          data: {
            category: dto.category ?? undefined,
            slug: dto.slug ?? undefined,
            title: dto.title ?? undefined,
            bodyMarkdown: dto.bodyMarkdown ?? undefined,
            tags: dto.tags !== undefined ? (dto.tags ?? undefined) : undefined,
            isPublished: dto.isPublished !== undefined ? (dto.isPublished ?? undefined) : undefined,
            authorUserId: dto.authorUserId !== undefined ? (dto.authorUserId ?? undefined) : undefined,
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
    return this.prisma.helpCenterArticle.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.helpCenterArticle.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`HelpCenterArticle ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertSlugUnique(tx, existing.instituteId, existing.slug, existing.id);

      return tx.helpCenterArticle.update({
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

  private async assertSlugUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    slug: string,
    excludeId?: string,
  ) {
    const clash = await tx.helpCenterArticle.findFirst({
      where: {
        instituteId,
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A HelpCenterArticle with slug "${slug}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A HelpCenterArticle with the same unique fields already exists.',
      );
    }
  }
}
