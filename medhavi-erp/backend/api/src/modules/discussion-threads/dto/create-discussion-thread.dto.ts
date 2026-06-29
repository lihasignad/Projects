import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
 * CreateDiscussionThreadDto
 *
 * Fields mirror the Prisma `DiscussionThread` model exactly:
 *   instituteId, courseId, authorUserId, title, body,
 *   status?, isAnnouncement?, viewCount?, lastActivityAt?
 *
 * Hierarchy validation (course belongs to institute, author belongs to
 * institute) is enforced in the service.
 */
export class CreateDiscussionThreadDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Owning Course UUID.', format: 'uuid' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'Author User UUID.', format: 'uuid' })
  @IsUUID()
  authorUserId!: string;

  @ApiProperty({ description: 'Thread title.', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  title!: string;

  @ApiProperty({ description: 'Thread body (rich text / markdown).' })
  @IsString()
  @Length(1, 65_535)
  body!: string;

  @ApiPropertyOptional({
    enum: DiscussionThreadStatus,
    default: DiscussionThreadStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(DiscussionThreadStatus)
  status?: DiscussionThreadStatus;

  @ApiPropertyOptional({
    description: 'Marks this thread as a course-wide announcement.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnnouncement?: boolean;

  @ApiPropertyOptional({
    description: 'Initial view counter (defaults to 0).',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  viewCount?: number;

  @ApiPropertyOptional({
    description:
      'Optional last-activity timestamp seed. Defaults to creation time.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  lastActivityAt?: string;
}
