import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscussionThreadStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

/**
 * UpdateDiscussionThreadDto
 *
 * Partial update of a DiscussionThread. `instituteId` is intentionally
 * immutable (mirrors resources / courses conventions) and is not exposed
 * here; tenancy moves require a delete + recreate.
 */
export class UpdateDiscussionThreadDto {
  @ApiPropertyOptional({ description: 'Owning Course UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Author User UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  authorUserId?: string;

  @ApiPropertyOptional({ description: 'Thread title.', maxLength: 255 })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @ApiPropertyOptional({ description: 'Thread body.' })
  @IsOptional()
  @IsString()
  @Length(1, 65_535)
  body?: string;

  @ApiPropertyOptional({ enum: DiscussionThreadStatus })
  @IsOptional()
  @IsEnum(DiscussionThreadStatus)
  status?: DiscussionThreadStatus;

  @ApiPropertyOptional({ description: 'Announcement flag.' })
  @IsOptional()
  @IsBoolean()
  isAnnouncement?: boolean;

  @ApiPropertyOptional({ description: 'View counter.', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  viewCount?: number;

  @ApiPropertyOptional({
    description: 'Last-activity timestamp.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  lastActivityAt?: string;
}
