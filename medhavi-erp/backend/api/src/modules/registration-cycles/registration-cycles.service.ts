import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, RegistrationCycleStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateRegistrationCycleDto } from './dto/create-registration-cycle.dto';
import { ListRegistrationCyclesQueryDto } from './dto/list-registration-cycles.query';
import { UpdateRegistrationCycleDto } from './dto/update-registration-cycle.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class RegistrationCyclesService {
  private readonly logger = new Logger(RegistrationCyclesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistrationCycleDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const term = await tx.term.findFirst({ where: { id: dto.termId, deletedAt: null } });
      if (!term) throw new NotFoundException(`Term ${dto.termId} not found.`);
      if (term.instituteId !== dto.instituteId) throw new BadRequestException('Term does not belong to institute.');

      if (new Date(dto.opensAt) >= new Date(dto.closesAt)) {
        throw new BadRequestException('opensAt must be strictly before closesAt.');
      }

      try {
        const rc = await tx.registrationCycle.create({
          data: {
            instituteId: dto.instituteId,
            termId: dto.termId,
            name: dto.name,
            opensAt: new Date(dto.opensAt),
            closesAt: new Date(dto.closesAt),
            addDropClosesAt: dto.addDropClosesAt ? new Date(dto.addDropClosesAt) : null,
            status: dto.status ?? RegistrationCycleStatus.PLANNED,
            minCredits: dto.minCredits !== undefined ? new Prisma.Decimal(dto.minCredits) : null,
            maxCredits: dto.maxCredits !== undefined ? new Prisma.Decimal(dto.maxCredits) : null,
            rulesJson: dto.rulesJson !== undefined ? (dto.rulesJson as Prisma.InputJsonValue) : undefined,
          },
        });
        this.logger.log(`RegistrationCycle created: ${rc.id}`);
        return rc;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('RegistrationCycle with this term and name already exists.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListRegistrationCyclesQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.RegistrationCycleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.registrationCycle.count({ where }),
      this.prisma.registrationCycle.findMany({ where, orderBy: { [query.sortBy ?? 'opensAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const rc = await this.prisma.registrationCycle.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!rc) throw new NotFoundException(`RegistrationCycle ${id} not found.`);
    return rc;
  }

  async update(id: string, dto: UpdateRegistrationCycleDto) {
    const existing = await this.findOne(id);
    const opens = dto.opensAt ? new Date(dto.opensAt) : existing.opensAt;
    const closes = dto.closesAt ? new Date(dto.closesAt) : existing.closesAt;
    if (opens >= closes) throw new BadRequestException('opensAt must be strictly before closesAt.');

    return this.prisma.registrationCycle.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        opensAt: dto.opensAt ? new Date(dto.opensAt) : undefined,
        closesAt: dto.closesAt ? new Date(dto.closesAt) : undefined,
        addDropClosesAt: dto.addDropClosesAt !== undefined ? (dto.addDropClosesAt ? new Date(dto.addDropClosesAt) : null) : undefined,
        status: dto.status ?? undefined,
        minCredits: dto.minCredits !== undefined ? (dto.minCredits !== null ? new Prisma.Decimal(dto.minCredits) : null) : undefined,
        maxCredits: dto.maxCredits !== undefined ? (dto.maxCredits !== null ? new Prisma.Decimal(dto.maxCredits) : null) : undefined,
        rulesJson: dto.rulesJson !== undefined ? (dto.rulesJson as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.registrationCycle.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.registrationCycle.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`RegistrationCycle ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.registrationCycle.update({ where: { id }, data: { deletedAt: null } });
  }
}
