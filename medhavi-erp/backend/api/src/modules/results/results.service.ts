import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, ResultGradeOutcome, ResultStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateResultDto } from './dto/create-result.dto';
import { ListResultsQueryDto } from './dto/list-results.query';
import { UpdateResultDto } from './dto/update-result.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const exam = await tx.exam.findFirst({ where: { id: dto.examId, deletedAt: null } });
      if (!exam) throw new NotFoundException(`Exam ${dto.examId} not found.`);
      if (exam.instituteId !== dto.instituteId) throw new BadRequestException('Exam does not belong to institute.');

      const offering = await tx.subjectOffering.findFirst({ where: { id: dto.subjectOfferingId, deletedAt: null } });
      if (!offering) throw new NotFoundException(`SubjectOffering ${dto.subjectOfferingId} not found.`);

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);
      if (st.instituteId !== dto.instituteId) throw new BadRequestException('Student does not belong to institute.');

      try {
        const res = await tx.result.create({
          data: {
            instituteId: dto.instituteId,
            examId: dto.examId,
            subjectOfferingId: dto.subjectOfferingId,
            studentId: dto.studentId,
            marksObtained: dto.marksObtained !== undefined ? new Prisma.Decimal(dto.marksObtained) : null,
            maxMarks: new Prisma.Decimal(dto.maxMarks),
            percentage: dto.percentage !== undefined ? new Prisma.Decimal(dto.percentage) : null,
            gradePoint: dto.gradePoint !== undefined ? new Prisma.Decimal(dto.gradePoint) : null,
            gradeLetter: dto.gradeLetter ?? null,
            credits: dto.credits !== undefined ? new Prisma.Decimal(dto.credits) : null,
            creditPoints: dto.creditPoints !== undefined ? new Prisma.Decimal(dto.creditPoints) : null,
            outcome: dto.outcome ?? ResultGradeOutcome.PENDING,
            status: dto.status ?? ResultStatus.COMPUTED,
            publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
            revisedAt: dto.revisedAt ? new Date(dto.revisedAt) : null,
            isMakeup: dto.isMakeup ?? false,
            remark: dto.remark ?? null,
          },
        });
        this.logger.log(`Result created: ${res.id}`);
        return res;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Result record already exists for this student in this exam subject offering.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListResultsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.ResultWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.examId ? { examId: query.examId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.outcome ? { outcome: query.outcome } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.result.count({ where }),
      this.prisma.result.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const res = await this.prisma.result.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!res) throw new NotFoundException(`Result ${id} not found.`);
    return res;
  }

  async update(id: string, dto: UpdateResultDto) {
    await this.findOne(id);
    return this.prisma.result.update({
      where: { id },
      data: {
        marksObtained: dto.marksObtained !== undefined ? (dto.marksObtained !== null ? new Prisma.Decimal(dto.marksObtained) : null) : undefined,
        maxMarks: dto.maxMarks !== undefined ? new Prisma.Decimal(dto.maxMarks) : undefined,
        percentage: dto.percentage !== undefined ? (dto.percentage !== null ? new Prisma.Decimal(dto.percentage) : null) : undefined,
        gradePoint: dto.gradePoint !== undefined ? (dto.gradePoint !== null ? new Prisma.Decimal(dto.gradePoint) : null) : undefined,
        gradeLetter: dto.gradeLetter !== undefined ? (dto.gradeLetter ?? null) : undefined,
        credits: dto.credits !== undefined ? (dto.credits !== null ? new Prisma.Decimal(dto.credits) : null) : undefined,
        creditPoints: dto.creditPoints !== undefined ? (dto.creditPoints !== null ? new Prisma.Decimal(dto.creditPoints) : null) : undefined,
        outcome: dto.outcome ?? undefined,
        status: dto.status ?? undefined,
        publishedAt: dto.publishedAt !== undefined ? (dto.publishedAt ? new Date(dto.publishedAt) : null) : undefined,
        revisedAt: dto.revisedAt !== undefined ? (dto.revisedAt ? new Date(dto.revisedAt) : null) : undefined,
        isMakeup: dto.isMakeup !== undefined ? dto.isMakeup : undefined,
        remark: dto.remark !== undefined ? (dto.remark ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.result.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.result.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Result ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.result.update({ where: { id }, data: { deletedAt: null } });
  }
}
