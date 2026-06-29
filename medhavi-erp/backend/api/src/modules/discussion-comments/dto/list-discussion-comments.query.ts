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
  ValidateIf,
} from 'class-validator';

const SORTABLE_FIELDS = [
  'createdAt',
  'updatedAt',
  'editedAt',
  'upvotes',
  'isAnswer',
] as const;
export type DiscussionCommentSortField = (typeof SORTABLE_FIELDS)[number];

const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : value;

/**
 * ListDiscussionCommentsQueryDto
 *
 * Mirrors ListDiscussionThreadsQueryDto: offset pagination, free-text
 * `search` against body, plus tenant/scope filters and sort controls.
 *
 * `parentId` accepts a UUID, the literal string `"null"` (to filter for
 * root comments only), or may be omitted. `rootOnly=true` is a
 * convenience equivalent to `parentId=null`.
 */
export class ListDiscussionCommentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parent institute UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owning DiscussionThread UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiPropertyOptional({
    description: 'Filter by author User UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  authorUserId?: string;

  @ApiPropertyOptional({
    description:
      'Filter by parent DiscussionComment UUID. Pass `null` to return ' +
      'only root comments.',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null ? null : value,
  )
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({
    description:
      'Convenience filter: when true, restrict results to root comments ' +
      '(parentId IS NULL).',
  })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  rootOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by accepted-answer flag.' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isAnswer?: boolean;

  @ApiPropertyOptional({
    description: 'Case-insensitive substring match on body.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted comments in the result set.',
    default: false,
  })
  @IsOptional()
  @Transform(toBool)
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
  sortBy?: DiscussionCommentSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
