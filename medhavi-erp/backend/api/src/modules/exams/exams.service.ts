import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ExamStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListExamsQueryDto } from './dto/list-exams.query';
import { UpdateExamDto } from './dto/update-exam.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExamDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);
      const term = await tx.term.findFirst({ where: { id: dto.termId, deletedAt: null } });
      if (!term) throw new NotFoundException(`Term ${dto.termId} not found.`);
      if (term.instituteId !== dto.instituteId) throw new BadRequestException('Term does not belong to institute.');
      if (dto.programId) {
        const prog = await tx.program.findFirst({ where: { id: dto.programId, deletedAt: null } });
        if (!prog) throw new NotFoundException(`Program ${dto.programId} not found.`);
        if (prog.instituteId !== dto.instituteId) throw new BadRequestException('Program does not belong to institute.');
      }
      if (dto.controllerUserId) {
        const user = await tx.user.findFirst({ where: { id: dto.controllerUserId, deletedAt: null } });
        if (!user) throw new NotFoundException(`User ${dto.controllerUserId} not found.`);
      }
      const clash = await tx.exam.findFirst({ where: { instituteId: dto.instituteId, code: dto.code, termId: dto.termId, deletedAt: null } });
      if (clash) throw new ConflictException(`Exam code "${dto.code}" already exists for this term.`);
      if (new Date(dto.startDate) > new Date(dto.endDate)) throw new BadRequestException('startDate must be on or before endDate.');
      try {
        const exam = await tx.exam.create({ data: {
          instituteId: dto.instituteId, termId: dto.termId, programId: dto.programId ?? null,
          name: dto.name, code: dto.code, type: dto.type, status: dto.status ?? ExamStatus.PLANNED,
          startDate: new Date(dto.startDate), endDate: new Date(dto.endDate),
          resultPublishedAt: dto.resultPublishedAt ? new Date(dto.resultPublishedAt) : null,
          controllerUserId: dto.controllerUserId ?? null, notes: dto.notes ?? null,
        }});
        this.logger.log(`Exam created: ${exam.id}`); return exam;
      } catch (err) { if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') throw new ConflictException('Exam with same code/term exists.'); throw err; }
    });
  }

  async findAll(query: ListExamsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.ExamWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.programId ? { programId: query.programId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { code: { contains: query.search, mode: 'insensitive' } }] } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({ where, orderBy: { [query.sortBy ?? 'startDate']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const exam = await this.prisma.exam.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!exam) throw new NotFoundException(`Exam ${id} not found.`);
    return exam;
  }

  async update(id: string, dto: UpdateExamDto) {
    const existing = await this.findOne(id);
    if (dto.code && dto.code !== existing.code) {
      const clash = await this.prisma.exam.findFirst({ where: { instituteId: existing.instituteId, code: dto.code, termId: existing.termId, deletedAt: null, NOT: { id } } });
      if (clash) throw new ConflictException(`Exam code "${dto.code}" already exists for this term.`);
    }
    const nextStart = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const nextEnd = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    if (nextStart > nextEnd) throw new BadRequestException('startDate must be on or before endDate.');
    return this.prisma.exam.update({ where: { id }, data: {
      programId: dto.programId !== undefined ? (dto.programId ?? null) : undefined,
      name: dto.name ?? undefined, code: dto.code ?? undefined, type: dto.type ?? undefined, status: dto.status ?? undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined, endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      resultPublishedAt: dto.resultPublishedAt !== undefined ? (dto.resultPublishedAt ? new Date(dto.resultPublishedAt) : null) : undefined,
      controllerUserId: dto.controllerUserId !== undefined ? (dto.controllerUserId ?? null) : undefined, notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
    }});
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.exam.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.exam.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Exam ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.exam.update({ where: { id }, data: { deletedAt: null } });
  }
}
