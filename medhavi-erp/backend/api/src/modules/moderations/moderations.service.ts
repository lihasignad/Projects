import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateModerationDto } from './dto/create-moderation.dto';
import { ListModerationsQueryDto } from './dto/list-moderations.query';
import { UpdateModerationDto } from './dto/update-moderation.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateModerationDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const me = await tx.marksEntry.findFirst({ where: { id: dto.marksEntryId, deletedAt: null } });
      if (!me) throw new NotFoundException(`MarksEntry ${dto.marksEntryId} not found.`);
      if (me.instituteId !== dto.instituteId) throw new BadRequestException('MarksEntry does not belong to institute.');

      const user = await tx.user.findFirst({ where: { id: dto.moderatorUserId, deletedAt: null } });
      if (!user) throw new NotFoundException(`User ${dto.moderatorUserId} not found.`);

      try {
        const mod = await tx.moderation.create({
          data: {
            instituteId: dto.instituteId,
            marksEntryId: dto.marksEntryId,
            moderatorUserId: dto.moderatorUserId,
            scalingFactor: dto.scalingFactor !== undefined ? new Prisma.Decimal(dto.scalingFactor) : null,
            graceMarks: dto.graceMarks !== undefined ? new Prisma.Decimal(dto.graceMarks) : null,
            cutoffAdjustment: dto.cutoffAdjustment !== undefined ? new Prisma.Decimal(dto.cutoffAdjustment) : null,
            rationale: dto.rationale ?? null,
            beforeStatsJson: dto.beforeStatsJson !== undefined ? (dto.beforeStatsJson as Prisma.InputJsonValue) : undefined,
            afterStatsJson: dto.afterStatsJson !== undefined ? (dto.afterStatsJson as Prisma.InputJsonValue) : undefined,
          },
        });
        this.logger.log(`Moderation created: ${mod.id}`);
        return mod;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Moderation record already exists for this marks entry.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListModerationsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.ModerationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.marksEntryId ? { marksEntryId: query.marksEntryId } : {}),
      ...(query.moderatorUserId ? { moderatorUserId: query.moderatorUserId } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.moderation.count({ where }),
      this.prisma.moderation.findMany({ where, orderBy: { [query.sortBy ?? 'moderatedAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const mod = await this.prisma.moderation.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!mod) throw new NotFoundException(`Moderation ${id} not found.`);
    return mod;
  }

  async update(id: string, dto: UpdateModerationDto) {
    await this.findOne(id);
    return this.prisma.moderation.update({
      where: { id },
      data: {
        moderatorUserId: dto.moderatorUserId ?? undefined,
        scalingFactor: dto.scalingFactor !== undefined ? (dto.scalingFactor !== null ? new Prisma.Decimal(dto.scalingFactor) : null) : undefined,
        graceMarks: dto.graceMarks !== undefined ? (dto.graceMarks !== null ? new Prisma.Decimal(dto.graceMarks) : null) : undefined,
        cutoffAdjustment: dto.cutoffAdjustment !== undefined ? (dto.cutoffAdjustment !== null ? new Prisma.Decimal(dto.cutoffAdjustment) : null) : undefined,
        rationale: dto.rationale !== undefined ? (dto.rationale ?? null) : undefined,
        beforeStatsJson: dto.beforeStatsJson !== undefined ? (dto.beforeStatsJson as Prisma.InputJsonValue) : undefined,
        afterStatsJson: dto.afterStatsJson !== undefined ? (dto.afterStatsJson as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.moderation.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.moderation.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Moderation ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.moderation.update({ where: { id }, data: { deletedAt: null } });
  }
}
