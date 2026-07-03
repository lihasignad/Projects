import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentStatus, AssignmentType, Prisma } from '@prisma/client';
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
  'title',
  'dueAt',
  'startsAt',
  'publishedAt',
  'maxMarks',
  'weightPct',
  'status',
] as const;
export type AssignmentSortField = (typeof SORTABLE_FIELDS)[number];

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : value;

/**
 * ListAssignmentsQueryDto
 *
 * Mirrors ListAssignmentCategoriesQueryDto: offset pagination, free-text
 * `search` across `title` and `description`, plus filters and sort controls.
 */
export class ListAssignmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parent institute UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owning Course UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owning SubjectOffering UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiPropertyOptional({
    description: 'Filter by AssignmentCategory UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by assignment type.', enum: AssignmentType })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({
    description: 'Filter by assignment status.',
    enum: AssignmentStatus,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({
    description: 'Case-insensitive substring match on title and description.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted assignments in the result set.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'dueAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: AssignmentSortField = 'dueAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
