import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, SubmissionStatus } from '@prisma/client';
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
  'submittedAt',
  'gradedAt',
  'attemptNumber',
  'marksAwarded',
  'status',
] as const;
export type AssignmentSubmissionSortField = (typeof SORTABLE_FIELDS)[number];

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : value;

/**
 * ListAssignmentSubmissionsQueryDto
 *
 * Mirrors ListAssignmentsQueryDto: offset pagination, free-text `search`
 * across the student's enrollment/roll number and the parent assignment's
 * title, plus filters and sort controls.
 */
export class ListAssignmentSubmissionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parent institute UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent Assignment UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by submitting Student UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by grader Faculty UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  gradedByFacultyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by submission status.',
    enum: SubmissionStatus,
  })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'Filter by late-submission flag.',
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isLate?: boolean;

  @ApiPropertyOptional({
    description:
      'Case-insensitive substring match on assignment title and student enrollment/roll number.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted submissions in the result set.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'submittedAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: AssignmentSubmissionSortField = 'submittedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
