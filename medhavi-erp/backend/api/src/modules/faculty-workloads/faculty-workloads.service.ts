import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFacultyWorkloadDto } from './dto/create-faculty-workload.dto';
import { ListFacultyWorkloadsQueryDto } from './dto/list-faculty-workloads.query';
import { UpdateFacultyWorkloadDto } from './dto/update-faculty-workload.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class FacultyWorkloadsService {
  private readonly logger = new Logger(FacultyWorkloadsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacultyWorkloadDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const fac = await tx.faculty.findFirst({ where: { id: dto.facultyId, deletedAt: null } });
      if (!fac) throw new NotFoundException(`Faculty ${dto.facultyId} not found.`);
      if (fac.instituteId !== dto.instituteId) throw new BadRequestException('Faculty does not belong to institute.');

      const term = await tx.term.findFirst({ where: { id: dto.termId, deletedAt: null } });
      if (!term) throw new NotFoundException(`Term ${dto.termId} not found.`);
      if (term.instituteId !== dto.instituteId) throw new BadRequestException('Term does not belong to institute.');

      try {
        const fw = await tx.facultyWorkload.create({
          data: {
            instituteId: dto.instituteId,
            facultyId: dto.facultyId,
            termId: dto.termId,
            lectureHoursPlanned: new Prisma.Decimal(dto.lectureHoursPlanned ?? 0),
            labHoursPlanned: new Prisma.Decimal(dto.labHoursPlanned ?? 0),
            tutorialHoursPlanned: new Prisma.Decimal(dto.tutorialHoursPlanned ?? 0),
            otherHoursPlanned: new Prisma.Decimal(dto.otherHoursPlanned ?? 0),
            totalHoursPlanned: new Prisma.Decimal(dto.totalHoursPlanned ?? 0),
            lectureHoursActual: new Prisma.Decimal(dto.lectureHoursActual ?? 0),
            labHoursActual: new Prisma.Decimal(dto.labHoursActual ?? 0),
            tutorialHoursActual: new Prisma.Decimal(dto.tutorialHoursActual ?? 0),
            otherHoursActual: new Prisma.Decimal(dto.otherHoursActual ?? 0),
            totalHoursActual: new Prisma.Decimal(dto.totalHoursActual ?? 0),
            maxHoursAllowed: dto.maxHoursAllowed !== undefined ? new Prisma.Decimal(dto.maxHoursAllowed) : null,
            notes: dto.notes ?? null,
            lastRecalculatedAt: dto.lastRecalculatedAt ? new Date(dto.lastRecalculatedAt) : null,
          },
        });
        this.logger.log(`FacultyWorkload created: ${fw.id}`);
        return fw;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('FacultyWorkload record already exists for this faculty and term.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListFacultyWorkloadsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.FacultyWorkloadWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.facultyId ? { facultyId: query.facultyId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.facultyWorkload.count({ where }),
      this.prisma.facultyWorkload.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const fw = await this.prisma.facultyWorkload.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!fw) throw new NotFoundException(`FacultyWorkload ${id} not found.`);
    return fw;
  }

  async update(id: string, dto: UpdateFacultyWorkloadDto) {
    await this.findOne(id);
    return this.prisma.facultyWorkload.update({
      where: { id },
      data: {
        lectureHoursPlanned: dto.lectureHoursPlanned !== undefined ? new Prisma.Decimal(dto.lectureHoursPlanned) : undefined,
        labHoursPlanned: dto.labHoursPlanned !== undefined ? new Prisma.Decimal(dto.labHoursPlanned) : undefined,
        tutorialHoursPlanned: dto.tutorialHoursPlanned !== undefined ? new Prisma.Decimal(dto.tutorialHoursPlanned) : undefined,
        otherHoursPlanned: dto.otherHoursPlanned !== undefined ? new Prisma.Decimal(dto.otherHoursPlanned) : undefined,
        totalHoursPlanned: dto.totalHoursPlanned !== undefined ? new Prisma.Decimal(dto.totalHoursPlanned) : undefined,
        lectureHoursActual: dto.lectureHoursActual !== undefined ? new Prisma.Decimal(dto.lectureHoursActual) : undefined,
        labHoursActual: dto.labHoursActual !== undefined ? new Prisma.Decimal(dto.labHoursActual) : undefined,
        tutorialHoursActual: dto.tutorialHoursActual !== undefined ? new Prisma.Decimal(dto.tutorialHoursActual) : undefined,
        otherHoursActual: dto.otherHoursActual !== undefined ? new Prisma.Decimal(dto.otherHoursActual) : undefined,
        totalHoursActual: dto.totalHoursActual !== undefined ? new Prisma.Decimal(dto.totalHoursActual) : undefined,
        maxHoursAllowed: dto.maxHoursAllowed !== undefined ? (dto.maxHoursAllowed !== null ? new Prisma.Decimal(dto.maxHoursAllowed) : null) : undefined,
        notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
        lastRecalculatedAt: dto.lastRecalculatedAt !== undefined ? (dto.lastRecalculatedAt ? new Date(dto.lastRecalculatedAt) : null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.facultyWorkload.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.facultyWorkload.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`FacultyWorkload ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.facultyWorkload.update({ where: { id }, data: { deletedAt: null } });
  }
}
