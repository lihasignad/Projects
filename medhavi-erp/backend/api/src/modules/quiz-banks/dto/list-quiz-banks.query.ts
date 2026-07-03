import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
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
  'name',
  'isShared',
] as const;
export type QuizBankSortField = (typeof SORTABLE_FIELDS)[number];

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : value;

/**
 * ListQuizBanksQueryDto
 *
 * Mirrors ListAssignmentCategoriesQueryDto: offset pagination, free-text
 * `search` across `name`, plus filters and sort controls.
 */
export class ListQuizBanksQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parent institute UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owning Faculty UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  ownerFacultyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owning Course UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owning Subject UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by shared flag.',
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isShared?: boolean;

  @ApiPropertyOptional({
    description: 'Case-insensitive substring match on name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted quiz banks in the result set.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'name' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: QuizBankSortField = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
