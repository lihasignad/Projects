import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  Prisma,
  QuizDifficulty,
  QuizQuestionType,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { ListQuizQuestionsQueryDto } from './dto/list-quiz-questions.query';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';

// Re-exported for future audit-log re-integration (mirrors quiz-banks.service).
export { AuditAction };

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Objective question types that MUST carry an `optionsJson` payload.
 * Subjective / free-response types (SHORT_ANSWER, LONG_ANSWER, NUMERIC,
 * FILL_BLANK, CODE) may omit it.
 */
const OBJECTIVE_TYPES: ReadonlySet<QuizQuestionType> = new Set<QuizQuestionType>(
  [
    QuizQuestionType.MCQ_SINGLE,
    QuizQuestionType.MCQ_MULTI,
    QuizQuestionType.TRUE_FALSE,
    QuizQuestionType.MATCHING,
  ],
);

/**
 * QuizQuestionsService
 *
 * CRUD + soft delete for the QuizQuestion aggregate. Audit logging is
 * intentionally omitted in this revision (parity with quiz-banks.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService
 * without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `quizBankId` references a non-deleted QuizBank in the same institute.
 *  - `type` is a valid QuizQuestionType (validated at DTO layer).
 *  - `difficulty` is a valid QuizDifficulty (validated at DTO layer).
 *  - `stemMarkdown` is non-empty.
 *  - `correctJson` is non-empty.
 *  - `optionsJson` is present for objective types
 *    (MCQ_SINGLE, MCQ_MULTI, TRUE_FALSE, MATCHING).
 *  - `marks` > 0.
 *  - `negativeMarks` >= 0.
 */
@Injectable()
export class QuizQuestionsService {
  private readonly logger = new Logger(QuizQuestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateQuizQuestionDto) {
    const marks = dto.marks ?? 1;
    const negativeMarks = dto.negativeMarks ?? 0;

    this.assertStemNotEmpty(dto.stemMarkdown);
    this.assertCorrectJsonNotEmpty(dto.correctJson);
    this.assertMarks(marks);
    this.assertNegativeMarks(negativeMarks);
    this.assertOptionsForObjectiveType(dto.type, dto.optionsJson);

    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertQuizBankBelongsToInstitute(
        tx,
        dto.quizBankId,
        dto.instituteId,
      );

      try {
        const question = await tx.quizQuestion.create({
          data: {
            instituteId: dto.instituteId,
            quizBankId: dto.quizBankId,
            type: dto.type,
            difficulty: dto.difficulty ?? undefined,
            stemMarkdown: dto.stemMarkdown,
            optionsJson:
              dto.optionsJson === undefined
                ? undefined
                : (dto.optionsJson as Prisma.InputJsonValue),
            correctJson: dto.correctJson as Prisma.InputJsonValue,
            explanation: dto.explanation ?? null,
            marks: new Prisma.Decimal(marks),
            negativeMarks: new Prisma.Decimal(negativeMarks),
            tags: dto.tags ?? [],
          },
        });

        this.logger.log(
          `QuizQuestion created: ${question.id} (bank=${question.quizBankId}, type=${question.type})`,
        );
        return question;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListQuizQuestionsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.quizQuestion.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.QuizQuestionWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.quizBankId ? { quizBankId: query.quizBankId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.search
        ? {
            stemMarkdown: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.quizQuestion.count({ where }),
      this.prisma.quizQuestion.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  // --------------------------------------------------------------------------
  // READ — single
  // --------------------------------------------------------------------------
  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const question = await this.prisma.quizQuestion.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!question) {
      throw new NotFoundException(`QuizQuestion ${id} not found.`);
    }
    return question;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateQuizQuestionDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizQuestion.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`QuizQuestion ${id} not found.`);
      }

      if (dto.stemMarkdown !== undefined) {
        this.assertStemNotEmpty(dto.stemMarkdown);
      }
      if (dto.correctJson !== undefined) {
        this.assertCorrectJsonNotEmpty(dto.correctJson);
      }
      if (dto.marks !== undefined) {
        this.assertMarks(dto.marks);
      }
      if (dto.negativeMarks !== undefined) {
        this.assertNegativeMarks(dto.negativeMarks);
      }

      const effectiveType = dto.type ?? existing.type;
      const effectiveOptions =
        dto.optionsJson !== undefined ? dto.optionsJson : existing.optionsJson;
      this.assertOptionsForObjectiveType(effectiveType, effectiveOptions);

      try {
        return await tx.quizQuestion.update({
          where: { id },
          data: {
            type: dto.type ?? undefined,
            difficulty: dto.difficulty ?? undefined,
            stemMarkdown: dto.stemMarkdown ?? undefined,
            optionsJson:
              dto.optionsJson === undefined
                ? undefined
                : (dto.optionsJson as Prisma.InputJsonValue),
            correctJson:
              dto.correctJson === undefined
                ? undefined
                : (dto.correctJson as Prisma.InputJsonValue),
            explanation:
              dto.explanation === undefined
                ? undefined
                : (dto.explanation ?? null),
            marks:
              dto.marks === undefined
                ? undefined
                : new Prisma.Decimal(dto.marks),
            negativeMarks:
              dto.negativeMarks === undefined
                ? undefined
                : new Prisma.Decimal(dto.negativeMarks),
            tags: dto.tags ?? undefined,
          },
        });
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.quizQuestion.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizQuestion.findFirst({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(`QuizQuestion ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy on restore.
      await this.assertInstituteExists(tx, existing.instituteId);
      await this.assertQuizBankBelongsToInstitute(
        tx,
        existing.quizBankId,
        existing.instituteId,
      );

      return tx.quizQuestion.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private assertStemNotEmpty(stemMarkdown: string) {
    if (!stemMarkdown || stemMarkdown.trim().length === 0) {
      throw new BadRequestException('`stemMarkdown` cannot be empty.');
    }
  }

  private assertCorrectJsonNotEmpty(correctJson: unknown) {
    if (correctJson === null || correctJson === undefined) {
      throw new BadRequestException('`correctJson` cannot be empty.');
    }
    if (Array.isArray(correctJson)) {
      if (correctJson.length === 0) {
        throw new BadRequestException('`correctJson` cannot be empty.');
      }
      return;
    }
    if (typeof correctJson === 'object') {
      if (Object.keys(correctJson as Record<string, unknown>).length === 0) {
        throw new BadRequestException('`correctJson` cannot be empty.');
      }
      return;
    }
    if (typeof correctJson === 'string' && correctJson.trim().length === 0) {
      throw new BadRequestException('`correctJson` cannot be empty.');
    }
  }

  private assertMarks(marks: number) {
    if (!(marks > 0)) {
      throw new BadRequestException('`marks` must be greater than 0.');
    }
  }

  private assertNegativeMarks(negativeMarks: number) {
    if (negativeMarks < 0) {
      throw new BadRequestException('`negativeMarks` cannot be negative.');
    }
  }

  private assertOptionsForObjectiveType(
    type: QuizQuestionType,
    optionsJson: unknown,
  ) {
    if (!OBJECTIVE_TYPES.has(type)) return;

    const missing =
      optionsJson === undefined ||
      optionsJson === null ||
      (Array.isArray(optionsJson) && optionsJson.length === 0) ||
      (typeof optionsJson === 'object' &&
        !Array.isArray(optionsJson) &&
        Object.keys(optionsJson as Record<string, unknown>).length === 0);

    if (missing) {
      throw new BadRequestException(
        `\`optionsJson\` is required for objective question type ${type}.`,
      );
    }
  }

  private async assertInstituteExists(
    tx: Prisma.TransactionClient,
    instituteId: string,
  ) {
    const institute = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!institute) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertQuizBankBelongsToInstitute(
    tx: Prisma.TransactionClient,
    quizBankId: string,
    instituteId: string,
  ) {
    const bank = await tx.quizBank.findFirst({
      where: { id: quizBankId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!bank) {
      throw new NotFoundException(`QuizBank ${quizBankId} not found.`);
    }
    if (bank.instituteId !== instituteId) {
      throw new BadRequestException(
        `QuizBank ${quizBankId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A QuizQuestion with a conflicting unique field already exists.',
      );
    }
  }
}
