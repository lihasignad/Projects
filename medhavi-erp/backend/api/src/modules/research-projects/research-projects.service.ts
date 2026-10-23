import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateResearchProjectDto } from './dto/create-research-project.dto';
import { ListResearchProjectsQueryDto } from './dto/list-research-projects.query';
import { UpdateResearchProjectDto } from './dto/update-research-project.dto';

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
export class ResearchProjectsService {
  private readonly logger = new Logger(ResearchProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateResearchProjectDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.researchProject.create({
          data: {
            instituteId: dto.instituteId,
            departmentId: dto.departmentId ?? undefined,
            principalInvestigatorFacultyId: dto.principalInvestigatorFacultyId,
            title: dto.title,
            abstract: dto.abstract ?? undefined,
            domain: dto.domain ?? undefined,
            keywords: dto.keywords ?? undefined,
            status: dto.status ?? undefined,
            startDate: dto.startDate ?? undefined,
            endDate: dto.endDate ?? undefined,
            budgetAmount: dto.budgetAmount !== undefined ? new Prisma.Decimal(dto.budgetAmount) : undefined,
            currency: dto.currency ?? undefined,
            fundingSource: dto.fundingSource ?? undefined,
            collaboratorsJson: dto.collaboratorsJson !== undefined ? (dto.collaboratorsJson as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`ResearchProject created: ${record.id}`);
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
    query: ListResearchProjectsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.researchProject.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.ResearchProjectWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.principalInvestigatorFacultyId ? { principalInvestigatorFacultyId: query.principalInvestigatorFacultyId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.domain ? { domain: query.domain } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.researchProject.count({ where }),
      this.prisma.researchProject.findMany({
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
    const record = await this.prisma.researchProject.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`ResearchProject ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateResearchProjectDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.researchProject.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`ResearchProject ${id} not found.`);
      }



      try {
        return await tx.researchProject.update({
          where: { id },
          data: {
            departmentId: dto.departmentId !== undefined ? (dto.departmentId ?? undefined) : undefined,
            principalInvestigatorFacultyId: dto.principalInvestigatorFacultyId ?? undefined,
            title: dto.title ?? undefined,
            abstract: dto.abstract !== undefined ? (dto.abstract ?? undefined) : undefined,
            domain: dto.domain !== undefined ? (dto.domain ?? undefined) : undefined,
            keywords: dto.keywords !== undefined ? (dto.keywords ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            startDate: dto.startDate !== undefined ? (dto.startDate ?? undefined) : undefined,
            endDate: dto.endDate !== undefined ? (dto.endDate ?? undefined) : undefined,
            budgetAmount: dto.budgetAmount !== undefined ? new Prisma.Decimal(dto.budgetAmount) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            fundingSource: dto.fundingSource !== undefined ? (dto.fundingSource ?? undefined) : undefined,
            collaboratorsJson: dto.collaboratorsJson !== undefined ? (dto.collaboratorsJson as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.researchProject.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.researchProject.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`ResearchProject ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.researchProject.update({
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
        'A ResearchProject with the same unique fields already exists.',
      );
    }
  }
}
