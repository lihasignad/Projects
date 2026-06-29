import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * UpdateDiscussionCommentDto
 *
 * Partial update of a DiscussionComment. `instituteId` and `threadId`
 * are intentionally immutable (mirrors discussion-threads / resources /
 * courses conventions) and are not exposed here; tenancy or thread
 * moves require a delete + recreate.
 *
 * `parentId` may be set to `null` to promote a reply to a root comment.
 */
export class UpdateDiscussionCommentDto {
  @ApiPropertyOptional({
    description:
      'Parent DiscussionComment UUID for threaded replies. Pass `null` to ' +
      'promote this comment to a root comment.',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Author User UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  authorUserId?: string;

  @ApiPropertyOptional({ description: 'Comment body.' })
  @IsOptional()
  @IsString()
  @Length(1, 65_535)
  body?: string;

  @ApiPropertyOptional({ description: 'Accepted-answer flag.' })
  @IsOptional()
  @IsBoolean()
  isAnswer?: boolean;

  @ApiPropertyOptional({ description: 'Upvote counter.', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  upvotes?: number;

  @ApiPropertyOptional({
    description:
      'Edited-at timestamp. Omitted updates auto-stamp when `body` changes.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  editedAt?: string;
}
