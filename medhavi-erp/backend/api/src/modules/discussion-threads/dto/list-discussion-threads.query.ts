import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscussionThreadStatus, Prisma } from '@prisma/client';
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
  'lastActivityAt',
  'title',
  'viewCount',
  'status',
] as const;
export type DiscussionThreadSortField = (typeof SORTABLE_FIELDS)[number];

/**
 * ListDiscussionThreadsQueryDto
 *
 * Mirrors ListResourcesQueryDto: offset pagination, free-text `search`
 * against title and body, plus tenant/scope filters and sort controls.
 */
export class ListDiscussionThreadsQueryDto {
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
    description: 'Filter by author User UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  authorUserId?: string;

  @ApiPropertyOptional({ enum: DiscussionThreadStatus })
  @IsOptional()
  @IsEnum(DiscussionThreadStatus)
  status?: DiscussionThreadStatus;

  @ApiPropertyOptional({ description: 'Filter by announcement flag.' })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
  @IsBoolean()
  isAnnouncement?: boolean;

  @ApiPropertyOptional({
    description: 'Case-insensitive substring match on title or body.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted threads in the result set.',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'lastActivityAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: DiscussionThreadSortField = 'lastActivityAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
