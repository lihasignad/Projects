import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * CreateAssignmentSubmissionDto
 *
 * Fields mirror the Prisma `AssignmentSubmission` model exactly:
 *   instituteId, assignmentId, studentId, attemptNumber, status,
 *   submittedAt?, isLate, contentText?, attachmentsJson?, marksAwarded?,
 *   feedbackText?, rubricResultJson?, gradedAt?, gradedByFacultyId?,
 *   similarityPct?
 *
 * Business rules (enforced in the service):
 *   - Institute / Assignment / Student must exist.
 *   - Assignment and Student must belong to the same institute.
 *   - Assignment.status must be PUBLISHED before a submission is created.
 *   - `attemptNumber` >= 1.
 *   - (assignmentId, studentId, attemptNumber) is unique.
 *   - `marksAwarded` cannot exceed Assignment.maxMarks.
 *   - `isLate` is derived automatically from `submittedAt` vs Assignment
 *     `dueAt` / `lateUntil` (any client-supplied value is overridden).
 *   - `gradedAt` is set automatically when `marksAwarded` is provided.
 *   - `gradedByFacultyId` (when provided) must exist in the same institute.
 */
export class CreateAssignmentSubmissionDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Target Assignment UUID.', format: 'uuid' })
  @IsUUID()
  assignmentId!: string;

  @ApiProperty({ description: 'Submitting Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({
    description: 'Attempt number (>= 1). Defaults to 1.',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  attemptNumber?: number;

  @ApiPropertyOptional({
    description: 'Submission lifecycle status.',
    enum: SubmissionStatus,
    default: SubmissionStatus.NOT_STARTED,
  })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'When the student submitted. ISO 8601.',
  })
  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @ApiPropertyOptional({
    description: 'Free-text submission body.',
  })
  @IsOptional()
  @IsString()
  contentText?: string;

  @ApiPropertyOptional({
    description: 'Attachments metadata (JSON).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  attachmentsJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'Marks awarded. Decimal(8,2). Must not exceed Assignment.maxMarks.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marksAwarded?: number;

  @ApiPropertyOptional({ description: 'Instructor feedback text.' })
  @IsOptional()
  @IsString()
  feedbackText?: string;

  @ApiPropertyOptional({
    description: 'Rubric grading result (JSON).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  rubricResultJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'When the submission was graded. Automatically set when `marksAwarded` is provided.',
  })
  @IsOptional()
  @IsDateString()
  gradedAt?: string;

  @ApiPropertyOptional({
    description: 'Grader Faculty UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  gradedByFacultyId?: string;

  @ApiPropertyOptional({
    description: 'Plagiarism similarity percentage. Decimal(5,2).',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  similarityPct?: number;
}
