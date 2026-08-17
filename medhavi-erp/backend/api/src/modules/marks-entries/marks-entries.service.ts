import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MarksEntryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateMarksEntryDto } from './dto/create-marks-entry.dto';
import { ListMarksEntriesQueryDto } from './dto/list-marks-entries.query';
import { UpdateMarksEntryDto } from './dto/update-marks-entry.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class MarksEntriesService {
  private readonly logger = new Logger(MarksEntriesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMarksEntryDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);
      const exam = await tx.exam.findFirst({ where: { id: dto.examId, deletedAt: null } });
      if (!exam) throw new NotFoundException(`Exam ${dto.examId} not found.`);
      if (exam.instituteId !== dto.instituteId) throw new BadRequestException('Exam does not belong to institute.');

      const offering = await tx.subjectOffering.findFirst({ where: { id: dto.subjectOfferingId, deletedAt: null } });
      if (!offering) throw new NotFoundException(`SubjectOffering ${dto.subjectOfferingId} not found.`);

      const fac = await tx.faculty.findFirst({ where: { id: dto.enteredByFacultyId, deletedAt: null } });
      if (!fac) throw new NotFoundException(`Faculty ${dto.enteredByFacultyId} not found.`);

      if (dto.approvedByUserId) {
        const u = await tx.user.findFirst({ where: { id: dto.approvedByUserId, deletedAt: null } });
        if (!u) throw new NotFoundException(`User ${dto.approvedByUserId} not found.`);
      }

      try {
        const me = await tx.marksEntry.create({
          data: {
            instituteId: dto.instituteId,
            examId: dto.examId,
            subjectOfferingId: dto.subjectOfferingId,
            enteredByFacultyId: dto.enteredByFacultyId,
            status: dto.status ?? MarksEntryStatus.DRAFT,
            totalStudents: dto.totalStudents,
            enteredCount: dto.enteredCount ?? 0,
            submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
            approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : null,
            approvedByUserId: dto.approvedByUserId ?? null,
            filePath: dto.filePath ?? null,
            remarks: dto.remarks ?? null,
          },
        });
        this.logger.log(`MarksEntry created: ${me.id}`);
        return me;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('MarksEntry already exists for this exam and subject offering.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListMarksEntriesQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.MarksEntryWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.examId ? { examId: query.examId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.enteredByFacultyId ? { enteredByFacultyId: query.enteredByFacultyId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.marksEntry.count({ where }),
      this.prisma.marksEntry.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const me = await this.prisma.marksEntry.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!me) throw new NotFoundException(`MarksEntry ${id} not found.`);
    return me;
  }

  async update(id: string, dto: UpdateMarksEntryDto) {
    await this.findOne(id);
    return this.prisma.marksEntry.update({
      where: { id },
      data: {
        enteredByFacultyId: dto.enteredByFacultyId ?? undefined,
        status: dto.status ?? undefined,
        totalStudents: dto.totalStudents ?? undefined,
        enteredCount: dto.enteredCount ?? undefined,
        submittedAt: dto.submittedAt !== undefined ? (dto.submittedAt ? new Date(dto.submittedAt) : null) : undefined,
        approvedAt: dto.approvedAt !== undefined ? (dto.approvedAt ? new Date(dto.approvedAt) : null) : undefined,
        approvedByUserId: dto.approvedByUserId !== undefined ? (dto.approvedByUserId ?? null) : undefined,
        filePath: dto.filePath !== undefined ? (dto.filePath ?? null) : undefined,
        remarks: dto.remarks !== undefined ? (dto.remarks ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.marksEntry.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.marksEntry.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`MarksEntry ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.marksEntry.update({ where: { id }, data: { deletedAt: null } });
  }
}
