import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentStatus, AssignmentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

/**
 * CreateAssignmentDto
 *
 * Fields mirror the Prisma `Assignment` model exactly:
 *   instituteId, courseId?, subjectOfferingId?, categoryId?,
 *   createdByFacultyId, title, description?, type, status,
 *   maxMarks, weightPct?, publishedAt?, startsAt?, dueAt,
 *   lateUntil?, latePenaltyPct?, allowResubmission, maxAttempts,
 *   isGroup, attachmentsJson?, rubricJson?
 *
 * Business rules (enforced in the service):
 *   - Exactly one of `courseId` or `subjectOfferingId` must be provided.
 *   - `dueAt` must be after `startsAt` (when both set).
 *   - `lateUntil` must be after `dueAt` (when set).
 *   - `maxAttempts` >= 1, `weightPct` in [0,100], `latePenaltyPct` in [0,100],
 *     `maxMarks` > 0.
 *   - Hierarchy validation for institute / course / subjectOffering /
 *     category / createdByFaculty.
 */
export class CreateAssignmentDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({
    description:
      'Owning Course UUID. Exactly one of `courseId` or `subjectOfferingId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description:
      'Owning SubjectOffering UUID. Exactly one of `courseId` or `subjectOfferingId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiPropertyOptional({
    description: 'Optional AssignmentCategory UUID this assignment rolls up to.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Authoring Faculty UUID.',
    format: 'uuid',
  })
  @IsUUID()
  createdByFacultyId!: string;

  @ApiProperty({ description: 'Assignment title.', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  title!: string;

  @ApiPropertyOptional({ description: 'Long-form assignment description.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Assignment type.',
    enum: AssignmentType,
    default: AssignmentType.HOMEWORK,
  })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({
    description: 'Assignment lifecycle status.',
    enum: AssignmentStatus,
    default: AssignmentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiProperty({
    description: 'Maximum marks. Decimal(8,2). Must be greater than 0.',
    minimum: 0,
    example: 100,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  maxMarks!: number;

  @ApiPropertyOptional({
    description: 'Weight percentage toward the final grade. Decimal(5,2).',
    minimum: 0,
    maximum: 100,
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  weightPct?: number;

  @ApiPropertyOptional({
    description: 'When the assignment was published to students. ISO 8601.',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({
    description: 'When the assignment window opens. ISO 8601.',
  })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({
    description: 'Deadline. Must be after `startsAt` when both set. ISO 8601.',
  })
  @IsDateString()
  dueAt!: string;

  @ApiPropertyOptional({
    description:
      'Late-submission cutoff. Must be after `dueAt` when set. ISO 8601.',
  })
  @IsOptional()
  @IsDateString()
  lateUntil?: string;

  @ApiPropertyOptional({
    description: 'Per-day (or per-submission) late penalty. Decimal(5,2).',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  latePenaltyPct?: number;

  @ApiPropertyOptional({
    description: 'Whether students may resubmit within `maxAttempts`.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowResubmission?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum submission attempts (>= 1).',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({
    description: 'Whether the assignment is a group submission.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @ApiPropertyOptional({
    description: 'Attachments metadata (JSON).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  attachmentsJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Rubric definition (JSON).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  rubricJson?: Record<string, unknown>;
}
