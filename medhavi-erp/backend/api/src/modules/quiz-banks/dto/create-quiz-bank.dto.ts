import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

/**
 * CreateQuizBankDto
 *
 * Fields mirror the Prisma `QuizBank` model exactly:
 *   instituteId, ownerFacultyId, subjectId?, courseId?, name, description?,
 *   isShared?
 *
 * Business rules (enforced in the service):
 *  - Exactly one of `courseId` or `subjectId` must be provided.
 *  - Hierarchy validation: institute, owner faculty, and (when provided)
 *    course/subject must exist and belong to the same institute.
 *  - `name` must not be empty.
 */
export class CreateQuizBankDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({
    description: 'Owning Faculty UUID (the quiz bank owner).',
    format: 'uuid',
  })
  @IsUUID()
  ownerFacultyId!: string;

  @ApiPropertyOptional({
    description:
      'Owning Course UUID. Exactly one of `courseId` or `subjectId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description:
      'Owning Subject UUID. Exactly one of `courseId` or `subjectId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({
    description: 'Quiz bank name (e.g. "Algebra I — Unit 1 Question Bank").',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiPropertyOptional({ description: 'Long-form description.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this bank is shared across the institute (visible to other faculty).',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
