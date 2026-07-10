import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizAttemptStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsIP,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * CreateQuizAttemptDto
 *
 * Fields mirror the Prisma `QuizAttempt` model exactly:
 *   instituteId, quizId, studentId, attemptNumber, status?, startedAt?,
 *   submittedAt?, durationSec?, responsesJson?, ipAddress?, deviceInfo?,
 *   flagsJson?
 *
 * Business rules (enforced in the service):
 *   - Institute, Quiz (same institute), Student (same institute) must exist.
 *   - Quiz has started (now >= quiz.startsAt) and has not ended
 *     (now <= quiz.endsAt).
 *   - `attemptNumber` >= 1 and <= quiz.maxAttempts.
 *   - Duplicate (quizId, studentId, attemptNumber) is rejected.
 *   - `startedAt` defaults to now when omitted.
 *   - `submittedAt`, when provided, is not before `startedAt`.
 *   - `durationSec`, when provided, is not negative.
 *   - `responsesJson` is optional until submission.
 */
export class CreateQuizAttemptDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Quiz UUID being attempted.', format: 'uuid' })
  @IsUUID()
  quizId!: string;

  @ApiProperty({
    description: 'Student UUID performing the attempt.',
    format: 'uuid',
  })
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description:
      'Attempt sequence number for (quizId, studentId). Must be >= 1 and <= quiz.maxAttempts.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  attemptNumber!: number;

  @ApiPropertyOptional({
    description: 'Attempt lifecycle status.',
    enum: QuizAttemptStatus,
    default: QuizAttemptStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(QuizAttemptStatus)
  status?: QuizAttemptStatus;

  @ApiPropertyOptional({
    description:
      'When the attempt started (ISO-8601). Defaults to now when omitted.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({
    description:
      'When the attempt was submitted (ISO-8601). Must not be before startedAt.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @ApiPropertyOptional({
    description: 'Total attempt duration in seconds. Must be >= 0.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSec?: number;

  @ApiPropertyOptional({
    description:
      'Free-form JSON of the student responses. Optional until submission.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  responsesJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Client IP address captured at attempt time.',
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Free-form device / user-agent descriptor.',
    maxLength: 512,
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  deviceInfo?: string;

  @ApiPropertyOptional({
    description: 'Free-form JSON of proctoring / integrity flags.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  flagsJson?: Record<string, unknown>;
}
