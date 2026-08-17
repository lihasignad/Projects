import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ExamScheduleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { ListExamSchedulesQueryDto } from './dto/list-exam-schedules.query';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class ExamSchedulesService {
  private readonly logger = new Logger(ExamSchedulesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExamScheduleDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);
      const exam = await tx.exam.findFirst({ where: { id: dto.examId, deletedAt: null } });
      if (!exam) throw new NotFoundException(`Exam ${dto.examId} not found.`);
      if (exam.instituteId !== dto.instituteId) throw new BadRequestException('Exam does not belong to institute.');
      
      const offering = await tx.subjectOffering.findFirst({ where: { id: dto.subjectOfferingId, deletedAt: null } });
      if (!offering) throw new NotFoundException(`SubjectOffering ${dto.subjectOfferingId} not found.`);

      if (dto.sectionId) {
        const sec = await tx.section.findFirst({ where: { id: dto.sectionId, deletedAt: null } });
        if (!sec) throw new NotFoundException(`Section ${dto.sectionId} not found.`);
      }
      if (dto.roomId) {
        const rm = await tx.room.findFirst({ where: { id: dto.roomId, deletedAt: null } });
        if (!rm) throw new NotFoundException(`Room ${dto.roomId} not found.`);
      }

      if (new Date(dto.startTime) >= new Date(dto.endTime)) {
        throw new BadRequestException('startTime must be strictly before endTime.');
      }

      try {
        const schedule = await tx.examSchedule.create({
          data: {
            instituteId: dto.instituteId,
            examId: dto.examId,
            subjectOfferingId: dto.subjectOfferingId,
            sectionId: dto.sectionId ?? null,
            examDate: new Date(dto.examDate),
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            durationMin: dto.durationMin,
            maxMarks: new Prisma.Decimal(dto.maxMarks),
            passingMarks: new Prisma.Decimal(dto.passingMarks),
            roomId: dto.roomId ?? null,
            status: dto.status ?? ExamScheduleStatus.SCHEDULED,
            notes: dto.notes ?? null,
          },
        });
        this.logger.log(`ExamSchedule created: ${schedule.id}`);
        return schedule;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('ExamSchedule unique constraint violated (examId, subjectOfferingId, sectionId).');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListExamSchedulesQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.ExamScheduleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.examId ? { examId: query.examId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.examSchedule.count({ where }),
      this.prisma.examSchedule.findMany({ where, orderBy: { [query.sortBy ?? 'examDate']: query.sortOrder ?? 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const schedule = await this.prisma.examSchedule.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!schedule) throw new NotFoundException(`ExamSchedule ${id} not found.`);
    return schedule;
  }

  async update(id: string, dto: UpdateExamScheduleDto) {
    const existing = await this.findOne(id);
    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    if (start >= end) throw new BadRequestException('startTime must be strictly before endTime.');

    return this.prisma.examSchedule.update({
      where: { id },
      data: {
        subjectOfferingId: dto.subjectOfferingId ?? undefined,
        sectionId: dto.sectionId !== undefined ? (dto.sectionId ?? null) : undefined,
        examDate: dto.examDate ? new Date(dto.examDate) : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        durationMin: dto.durationMin ?? undefined,
        maxMarks: dto.maxMarks !== undefined ? new Prisma.Decimal(dto.maxMarks) : undefined,
        passingMarks: dto.passingMarks !== undefined ? new Prisma.Decimal(dto.passingMarks) : undefined,
        roomId: dto.roomId !== undefined ? (dto.roomId ?? null) : undefined,
        status: dto.status ?? undefined,
        notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.examSchedule.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.examSchedule.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`ExamSchedule ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.examSchedule.update({ where: { id }, data: { deletedAt: null } });
  }
}
