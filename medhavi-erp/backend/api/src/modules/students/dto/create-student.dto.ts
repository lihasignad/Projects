import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * CreateStudentDto
 *
 * Fields mirror the Prisma `Student` model exactly:
 *   instituteId, userId, enrollmentNo, rollNo?, programId, batchId,
 *   sectionId?, admissionDate, status?
 *
 * Hierarchy invariants (Program belongs to Institute, Batch belongs to
 * Program & Institute, Section belongs to Batch) are enforced in the service.
 *
 * `status` is a free-form string in the schema (`@default("ACTIVE")`); we
 * cap its length defensively but do not constrain to an enum here.
 */
export class CreateStudentDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({
    description: 'Linked auth User UUID. Must be globally unique among students.',
    format: 'uuid',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description:
      'Institute-issued enrollment number (unique within an institute among non-deleted students).',
    minLength: 1,
    maxLength: 64,
    example: 'MEDH-2025-CSE-0001',
  })
  @IsString()
  @Length(1, 64)
  @Matches(/^[A-Za-z0-9_\-\/]+$/, {
    message:
      'enrollmentNo may only contain letters, digits, underscore, hyphen, and slash.',
  })
  enrollmentNo!: string;

  @ApiPropertyOptional({
    description: 'Section/class roll number (free-form).',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  rollNo?: string;

  @ApiProperty({ description: 'Parent program UUID.', format: 'uuid' })
  @IsUUID()
  programId!: string;

  @ApiProperty({ description: 'Parent batch UUID.', format: 'uuid' })
  @IsUUID()
  batchId!: string;

  @ApiPropertyOptional({
    description: 'Section UUID under the given batch.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiProperty({
    description: 'Date of admission (ISO-8601 date).',
    format: 'date',
    example: '2025-07-15',
  })
  @IsDateString()
  admissionDate!: string;

  @ApiPropertyOptional({
    description: 'Lifecycle status of the student record.',
    default: 'ACTIVE',
    maxLength: 32,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}
