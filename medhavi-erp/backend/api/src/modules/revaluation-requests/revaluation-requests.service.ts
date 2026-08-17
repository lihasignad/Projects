import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, RevaluationStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateRevaluationRequestDto } from './dto/create-revaluation-request.dto';
import { ListRevaluationRequestsQueryDto } from './dto/list-revaluation-requests.query';
import { UpdateRevaluationRequestDto } from './dto/update-revaluation-request.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class RevaluationRequestsService {
  private readonly logger = new Logger(RevaluationRequestsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRevaluationRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const exam = await tx.exam.findFirst({ where: { id: dto.examId, deletedAt: null } });
      if (!exam) throw new NotFoundException(`Exam ${dto.examId} not found.`);
      if (exam.instituteId !== dto.instituteId) throw new BadRequestException('Exam does not belong to institute.');

      const res = await tx.result.findFirst({ where: { id: dto.resultId, deletedAt: null } });
      if (!res) throw new NotFoundException(`Result ${dto.resultId} not found.`);

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);
      if (st.instituteId !== dto.instituteId) throw new BadRequestException('Student does not belong to institute.');

      if (dto.invoiceId) {
        const inv = await tx.invoice.findFirst({ where: { id: dto.invoiceId, deletedAt: null } });
        if (!inv) throw new NotFoundException(`Invoice ${dto.invoiceId} not found.`);
      }
      if (dto.decidedByUserId) {
        const u = await tx.user.findFirst({ where: { id: dto.decidedByUserId, deletedAt: null } });
        if (!u) throw new NotFoundException(`User ${dto.decidedByUserId} not found.`);
      }

      const rev = await tx.revaluationRequest.create({
        data: {
          instituteId: dto.instituteId,
          examId: dto.examId,
          resultId: dto.resultId,
          studentId: dto.studentId,
          reason: dto.reason,
          status: dto.status ?? RevaluationStatus.REQUESTED,
          feeAmount: dto.feeAmount !== undefined ? new Prisma.Decimal(dto.feeAmount) : null,
          feePaidAt: dto.feePaidAt ? new Date(dto.feePaidAt) : null,
          invoiceId: dto.invoiceId ?? null,
          oldMarks: dto.oldMarks !== undefined ? new Prisma.Decimal(dto.oldMarks) : null,
          newMarks: dto.newMarks !== undefined ? new Prisma.Decimal(dto.newMarks) : null,
          decidedAt: dto.decidedAt ? new Date(dto.decidedAt) : null,
          decidedByUserId: dto.decidedByUserId ?? null,
          remarks: dto.remarks ?? null,
        },
      });
      this.logger.log(`RevaluationRequest created: ${rev.id}`);
      return rev;
    });
  }

  async findAll(query: ListRevaluationRequestsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.RevaluationRequestWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.examId ? { examId: query.examId } : {}),
      ...(query.resultId ? { resultId: query.resultId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.revaluationRequest.count({ where }),
      this.prisma.revaluationRequest.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const rev = await this.prisma.revaluationRequest.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!rev) throw new NotFoundException(`RevaluationRequest ${id} not found.`);
    return rev;
  }

  async update(id: string, dto: UpdateRevaluationRequestDto) {
    await this.findOne(id);
    return this.prisma.revaluationRequest.update({
      where: { id },
      data: {
        reason: dto.reason ?? undefined,
        status: dto.status ?? undefined,
        feeAmount: dto.feeAmount !== undefined ? (dto.feeAmount !== null ? new Prisma.Decimal(dto.feeAmount) : null) : undefined,
        feePaidAt: dto.feePaidAt !== undefined ? (dto.feePaidAt ? new Date(dto.feePaidAt) : null) : undefined,
        invoiceId: dto.invoiceId !== undefined ? (dto.invoiceId ?? null) : undefined,
        oldMarks: dto.oldMarks !== undefined ? (dto.oldMarks !== null ? new Prisma.Decimal(dto.oldMarks) : null) : undefined,
        newMarks: dto.newMarks !== undefined ? (dto.newMarks !== null ? new Prisma.Decimal(dto.newMarks) : null) : undefined,
        decidedAt: dto.decidedAt !== undefined ? (dto.decidedAt ? new Date(dto.decidedAt) : null) : undefined,
        decidedByUserId: dto.decidedByUserId !== undefined ? (dto.decidedByUserId ?? null) : undefined,
        remarks: dto.remarks !== undefined ? (dto.remarks ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.revaluationRequest.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.revaluationRequest.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`RevaluationRequest ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.revaluationRequest.update({ where: { id }, data: { deletedAt: null } });
  }
}
