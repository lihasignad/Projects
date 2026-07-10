import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, QuizAttemptStatus } from '@prisma/client';
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
  'startedAt',
  'submittedAt',
  'attemptNumber',
  'durationSec',
  'status',
] as const;
export type QuizAttemptSortField = (typeof SORTABLE_FIELDS)[number];

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : value;

/**
 * ListQuizAttemptsQueryDto
 *
 * Mirrors ListQuizzesQueryDto: offset pagination, free-text `search`
 * against `deviceInfo` and `ipAddress`, plus filters and sort controls.
 */
export class ListQuizAttemptsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parent institute UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Quiz UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  quizId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Student UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by attempt status.',
    enum: QuizAttemptStatus,
  })
  @IsOptional()
  @IsEnum(QuizAttemptStatus)
  status?: QuizAttemptStatus;

  @ApiPropertyOptional({
    description:
      'Case-insensitive substring match on `deviceInfo` and `ipAddress`.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted quiz attempts in the result set.',
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
  sortBy?: QuizAttemptSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
