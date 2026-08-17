import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { ListTranscriptsQueryDto } from './dto/list-transcripts.query';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class TranscriptsService {
  private readonly logger = new Logger(TranscriptsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTranscriptDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);
      if (st.instituteId !== dto.instituteId) throw new BadRequestException('Student does not belong to institute.');

      if (dto.termId) {
        const t = await tx.term.findFirst({ where: { id: dto.termId, deletedAt: null } });
        if (!t) throw new NotFoundException(`Term ${dto.termId} not found.`);
      }
      if (dto.issuedByUserId) {
        const u = await tx.user.findFirst({ where: { id: dto.issuedByUserId, deletedAt: null } });
        if (!u) throw new NotFoundException(`User ${dto.issuedByUserId} not found.`);
      }

      try {
        const tr = await tx.transcript.create({
          data: {
            instituteId: dto.instituteId,
            studentId: dto.studentId,
            termId: dto.termId ?? null,
            isCumulative: dto.isCumulative ?? false,
            totalCreditsEarned: dto.totalCreditsEarned !== undefined ? new Prisma.Decimal(dto.totalCreditsEarned) : null,
            sgpa: dto.sgpa !== undefined ? new Prisma.Decimal(dto.sgpa) : null,
            cgpa: dto.cgpa !== undefined ? new Prisma.Decimal(dto.cgpa) : null,
            rank: dto.rank ?? null,
            classification: dto.classification ?? null,
            issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
            issuedByUserId: dto.issuedByUserId ?? null,
            fileObjectId: dto.fileObjectId ?? null,
            verificationCode: dto.verificationCode,
            payloadJson: dto.payloadJson !== undefined ? (dto.payloadJson as Prisma.InputJsonValue) : undefined,
          },
        });
        this.logger.log(`Transcript created: ${tr.id}`);
        return tr;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Transcript with this verification code or student/term combination already exists.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListTranscriptsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.TranscriptWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(typeof query.isCumulative === 'boolean' ? { isCumulative: query.isCumulative } : {}),
      ...(query.verificationCode ? { verificationCode: query.verificationCode } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.transcript.count({ where }),
      this.prisma.transcript.findMany({ where, orderBy: { [query.sortBy ?? 'issuedAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const tr = await this.prisma.transcript.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!tr) throw new NotFoundException(`Transcript ${id} not found.`);
    return tr;
  }

  async update(id: string, dto: UpdateTranscriptDto) {
    await this.findOne(id);
    return this.prisma.transcript.update({
      where: { id },
      data: {
        termId: dto.termId !== undefined ? (dto.termId ?? null) : undefined,
        isCumulative: dto.isCumulative !== undefined ? dto.isCumulative : undefined,
        totalCreditsEarned: dto.totalCreditsEarned !== undefined ? (dto.totalCreditsEarned !== null ? new Prisma.Decimal(dto.totalCreditsEarned) : null) : undefined,
        sgpa: dto.sgpa !== undefined ? (dto.sgpa !== null ? new Prisma.Decimal(dto.sgpa) : null) : undefined,
        cgpa: dto.cgpa !== undefined ? (dto.cgpa !== null ? new Prisma.Decimal(dto.cgpa) : null) : undefined,
        rank: dto.rank !== undefined ? (dto.rank ?? null) : undefined,
        classification: dto.classification !== undefined ? (dto.classification ?? null) : undefined,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        issuedByUserId: dto.issuedByUserId !== undefined ? (dto.issuedByUserId ?? null) : undefined,
        fileObjectId: dto.fileObjectId !== undefined ? (dto.fileObjectId ?? null) : undefined,
        payloadJson: dto.payloadJson !== undefined ? (dto.payloadJson as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.transcript.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.transcript.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Transcript ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.transcript.update({ where: { id }, data: { deletedAt: null } });
  }
}
