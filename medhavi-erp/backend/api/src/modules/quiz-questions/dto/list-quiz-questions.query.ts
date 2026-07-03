import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, QuizDifficulty, QuizQuestionType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const SORTABLE_FIELDS = [
  'createdAt',
  'updatedAt',
  'type',
  'difficulty',
  'marks',
  'negativeMarks',
] as const;
export type QuizQuestionSortField = (typeof SORTABLE_FIELDS)[number];

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : value;

/**
 * ListQuizQuestionsQueryDto
 *
 * Mirrors ListQuizBanksQueryDto: offset pagination, free-text `search`
 * against the `stemMarkdown`, plus filters and sort controls.
 */
export class ListQuizQuestionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parent institute UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent QuizBank UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  quizBankId?: string;

  @ApiPropertyOptional({
    description: 'Filter by question type.',
    enum: QuizQuestionType,
  })
  @IsOptional()
  @IsEnum(QuizQuestionType)
  type?: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Filter by difficulty.',
    enum: QuizDifficulty,
  })
  @IsOptional()
  @IsEnum(QuizDifficulty)
  difficulty?: QuizDifficulty;

  @ApiPropertyOptional({
    description: 'Case-insensitive substring match on `stemMarkdown`.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted questions in the result set.',
    default: false,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: QuizQuestionSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
