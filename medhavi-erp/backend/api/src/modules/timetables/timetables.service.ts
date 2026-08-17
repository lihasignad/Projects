import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TimetableStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { ListTimetablesQueryDto } from './dto/list-timetables.query';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

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
export class TimetablesService {
  private readonly logger = new Logger(TimetablesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimetableDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertTermBelongsToInstitute(tx, dto.termId, dto.instituteId);
      await this.assertSectionBelongsToInstitute(tx, dto.sectionId, dto.instituteId);
      if (dto.publishedById) {
        await this.assertUserBelongsToInstitute(tx, dto.publishedById, dto.instituteId);
      }

      const version = dto.version ?? 1;
      const existing = await tx.timetable.findFirst({
        where: {
          sectionId: dto.sectionId,
          termId: dto.termId,
          version,
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException(`Timetable for section ${dto.sectionId}, term ${dto.termId}, version ${version} already exists.`);
      }

      try {
        const timetable = await tx.timetable.create({
          data: {
            instituteId: dto.instituteId,
            termId: dto.termId,
            sectionId: dto.sectionId,
            name: dto.name,
            effectiveFrom: new Date(dto.effectiveFrom),
            effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
            status: dto.status ?? TimetableStatus.DRAFT,
            version,
            publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
            publishedById: dto.publishedById ?? null,
            notes: dto.notes ?? null,
          },
        });

        this.logger.log(`Timetable created: ${timetable.id} (${timetable.name})`);
        return timetable;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListTimetablesQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.timetable.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.TimetableWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            name: { contains: query.search, mode: 'insensitive' },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.timetable.count({ where }),
      this.prisma.timetable.findMany({
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

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const timetable = await this.prisma.timetable.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!timetable) {
      throw new NotFoundException(`Timetable ${id} not found.`);
    }
    return timetable;
  }

  async update(id: string, dto: UpdateTimetableDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.timetable.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Timetable ${id} not found.`);
      }

      if (dto.publishedById && dto.publishedById !== existing.publishedById) {
        await this.assertUserBelongsToInstitute(tx, dto.publishedById, existing.instituteId);
      }

      const nextVersion = dto.version ?? existing.version;
      if (nextVersion !== existing.version) {
        const clash = await tx.timetable.findFirst({
          where: {
            sectionId: existing.sectionId,
            termId: existing.termId,
            version: nextVersion,
            deletedAt: null,
            NOT: { id },
          },
        });
        if (clash) {
          throw new ConflictException(`Timetable version ${nextVersion} already exists for this section and term.`);
        }
      }

      try {
        return await tx.timetable.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
            effectiveTo: dto.effectiveTo !== undefined ? (dto.effectiveTo ? new Date(dto.effectiveTo) : null) : undefined,
            status: dto.status ?? undefined,
            version: dto.version ?? undefined,
            publishedAt: dto.publishedAt !== undefined ? (dto.publishedAt ? new Date(dto.publishedAt) : null) : undefined,
            publishedById: dto.publishedById !== undefined ? (dto.publishedById ?? null) : undefined,
            notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
          },
        });
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.timetable.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.timetable.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Timetable ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      return tx.timetable.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertTermBelongsToInstitute(tx: Prisma.TransactionClient, termId: string, instituteId: string) {
    const t = await tx.term.findFirst({ where: { id: termId, deletedAt: null } });
    if (!t) throw new NotFoundException(`Term ${termId} not found.`);
    if (t.instituteId !== instituteId) throw new BadRequestException(`Term ${termId} does not belong to institute ${instituteId}.`);
  }

  private async assertSectionBelongsToInstitute(tx: Prisma.TransactionClient, sectionId: string, instituteId: string) {
    const s = await tx.section.findFirst({ where: { id: sectionId, deletedAt: null } });
    if (!s) throw new NotFoundException(`Section ${sectionId} not found.`);
    if (s.instituteId !== instituteId) throw new BadRequestException(`Section ${sectionId} does not belong to institute ${instituteId}.`);
  }

  private async assertUserBelongsToInstitute(tx: Prisma.TransactionClient, userId: string, instituteId: string) {
    const u = await tx.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!u) throw new NotFoundException(`User ${userId} not found.`);
    if (u.instituteId && u.instituteId !== instituteId) throw new BadRequestException(`User ${userId} does not belong to institute ${instituteId}.`);
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('A timetable with this section, term, and version already exists.');
    }
  }
}
