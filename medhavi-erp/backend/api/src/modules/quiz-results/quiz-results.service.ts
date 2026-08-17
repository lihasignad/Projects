import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateQuizResultDto } from './dto/create-quiz-result.dto';
import { ListQuizResultsQueryDto } from './dto/list-quiz-results.query';
import { UpdateQuizResultDto } from './dto/update-quiz-result.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class QuizResultsService {
  private readonly logger = new Logger(QuizResultsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuizResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const att = await tx.quizAttempt.findFirst({ where: { id: dto.attemptId, deletedAt: null } });
      if (!att) throw new NotFoundException(`QuizAttempt ${dto.attemptId} not found.`);
      if (att.instituteId !== dto.instituteId) throw new BadRequestException('Attempt does not belong to institute.');

      if (dto.gradedByUserId) {
        const u = await tx.user.findFirst({ where: { id: dto.gradedByUserId, deletedAt: null } });
        if (!u) throw new NotFoundException(`User ${dto.gradedByUserId} not found.`);
      }

      try {
        const qr = await tx.quizResult.create({
          data: {
            instituteId: dto.instituteId,
            attemptId: dto.attemptId,
            marksAwarded: new Prisma.Decimal(dto.marksAwarded),
            totalMarks: new Prisma.Decimal(dto.totalMarks),
            percentage: new Prisma.Decimal(dto.percentage),
            passed: dto.passed,
            correctCount: dto.correctCount,
            incorrectCount: dto.incorrectCount,
            unansweredCount: dto.unansweredCount,
            perQuestionJson: dto.perQuestionJson !== undefined ? (dto.perQuestionJson as Prisma.InputJsonValue) : undefined,
            gradedAt: dto.gradedAt ? new Date(dto.gradedAt) : new Date(),
            gradedByUserId: dto.gradedByUserId ?? null,
          },
        });
        this.logger.log(`QuizResult created: ${qr.id}`);
        return qr;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('QuizResult record already exists for this attempt.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListQuizResultsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.QuizResultWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.attemptId ? { attemptId: query.attemptId } : {}),
      ...(typeof query.passed === 'boolean' ? { passed: query.passed } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.quizResult.count({ where }),
      this.prisma.quizResult.findMany({ where, orderBy: { [query.sortBy ?? 'gradedAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const qr = await this.prisma.quizResult.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!qr) throw new NotFoundException(`QuizResult ${id} not found.`);
    return qr;
  }

  async update(id: string, dto: UpdateQuizResultDto) {
    await this.findOne(id);
    return this.prisma.quizResult.update({
      where: { id },
      data: {
        marksAwarded: dto.marksAwarded !== undefined ? new Prisma.Decimal(dto.marksAwarded) : undefined,
        totalMarks: dto.totalMarks !== undefined ? new Prisma.Decimal(dto.totalMarks) : undefined,
        percentage: dto.percentage !== undefined ? new Prisma.Decimal(dto.percentage) : undefined,
        passed: dto.passed !== undefined ? dto.passed : undefined,
        correctCount: dto.correctCount ?? undefined,
        incorrectCount: dto.incorrectCount ?? undefined,
        unansweredCount: dto.unansweredCount ?? undefined,
        perQuestionJson: dto.perQuestionJson !== undefined ? (dto.perQuestionJson as Prisma.InputJsonValue) : undefined,
        gradedAt: dto.gradedAt ? new Date(dto.gradedAt) : undefined,
        gradedByUserId: dto.gradedByUserId !== undefined ? (dto.gradedByUserId ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.quizResult.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.quizResult.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`QuizResult ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.quizResult.update({ where: { id }, data: { deletedAt: null } });
  }
}
