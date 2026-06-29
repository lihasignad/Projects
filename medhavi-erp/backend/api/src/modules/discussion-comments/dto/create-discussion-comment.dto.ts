import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

/**
 * CreateDiscussionCommentDto
 *
 * Fields mirror the Prisma `DiscussionComment` model exactly:
 *   instituteId, threadId, parentId?, authorUserId, body,
 *   isAnswer?, upvotes?, editedAt?
 *
 * Hierarchy validation (thread belongs to institute, author belongs to
 * institute, parent belongs to the same thread) is enforced in the
 * service.
 */
export class CreateDiscussionCommentDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({
    description: 'Owning DiscussionThread UUID.',
    format: 'uuid',
  })
  @IsUUID()
  threadId!: string;

  @ApiPropertyOptional({
    description:
      'Optional parent DiscussionComment UUID for threaded replies. ' +
      'Must belong to the same thread.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Author User UUID.', format: 'uuid' })
  @IsUUID()
  authorUserId!: string;

  @ApiProperty({ description: 'Comment body (rich text / markdown).' })
  @IsString()
  @Length(1, 65_535)
  body!: string;

  @ApiPropertyOptional({
    description: 'Marks this comment as the accepted answer for the thread.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnswer?: boolean;

  @ApiPropertyOptional({
    description: 'Initial upvote counter (defaults to 0).',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  upvotes?: number;

  @ApiPropertyOptional({
    description:
      'Optional edited-at timestamp seed. Usually unset on creation.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  editedAt?: string;
}
