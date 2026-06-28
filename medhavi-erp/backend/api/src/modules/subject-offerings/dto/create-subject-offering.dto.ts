import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GradingScheme, SubjectOfferingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';

/**
 * CreateSubjectOfferingDto
 *
 * Fields mirror the Prisma `SubjectOffering` model exactly:
 *   instituteId, subjectId, termId, sectionId?, programId?, departmentId,
 *   offeringCode, capacity, enrolledCount?, waitlistCount?, creditsOverride?,
 *   gradingScheme?, registrationStart?, registrationEnd?, status?,
 *   syllabusFileId?, metadata?
 *
 * Hierarchy validation (subject/term/department/program/section belong to the
 * same institute) and uniqueness invariants (`offeringCode` unique within
 * term; `(subjectId, termId, sectionId)` unique) are enforced in the service.
 */
export class CreateSubjectOfferingDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Subject UUID being offered.', format: 'uuid' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'Term UUID this offering belongs to.', format: 'uuid' })
  @IsUUID()
  termId!: string;

  @ApiPropertyOptional({
    description: 'Optional Section UUID (when offering is section-scoped).',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({
    description: 'Optional Program UUID this offering is scoped to.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({ description: 'Owning department UUID.', format: 'uuid' })
  @IsUUID()
  departmentId!: string;

  @ApiProperty({
    description:
      'Offering code (unique within the term among non-deleted offerings).',
    minLength: 1,
    maxLength: 64,
    example: 'CS201-AY25-S1-A',
  })
  @IsString()
  @Length(1, 64)
  @Matches(/^[A-Za-z0-9_\-\/.]+$/, {
    message:
      'offeringCode may only contain letters, digits, underscore, hyphen, slash, and dot.',
  })
  offeringCode!: string;

  @ApiProperty({ description: 'Maximum seats in the offering.', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({
    description: 'Currently enrolled student count (defaults to 0).',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  enrolledCount?: number;

  @ApiPropertyOptional({
    description: 'Current waitlist count (defaults to 0).',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  waitlistCount?: number;

  @ApiPropertyOptional({
    description:
      'Optional credits override (Decimal(4,2)) — overrides Subject.credits for this offering.',
    example: '3.00',
  })
  @IsOptional()
  @IsNumberString()
  creditsOverride?: string;

  @ApiPropertyOptional({ enum: GradingScheme })
  @IsOptional()
  @IsEnum(GradingScheme)
  gradingScheme?: GradingScheme;

  @ApiPropertyOptional({
    description: 'Registration window start (ISO-8601).',
  })
  @IsOptional()
  @IsDateString()
  registrationStart?: string;

  @ApiPropertyOptional({
    description: 'Registration window end (ISO-8601).',
  })
  @IsOptional()
  @IsDateString()
  registrationEnd?: string;

  @ApiPropertyOptional({
    enum: SubjectOfferingStatus,
    default: SubjectOfferingStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(SubjectOfferingStatus)
  status?: SubjectOfferingStatus;

  @ApiPropertyOptional({
    description: 'Optional syllabus FileObject UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  syllabusFileId?: string;

  @ApiPropertyOptional({
    description: 'Free-form metadata bag.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
