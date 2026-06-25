import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicYearStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

/**
 * CreateAcademicYearDto
 *
 * Mirrors CreateProgramDto conventions:
 * - `code` is UPPER alphanumeric (plus '-' / '_') and unique per institute
 *   (e.g. "AY-2025-26").
 * - `name` is unique per institute.
 * - `startDate` must be strictly before `endDate`.
 * - Service enforces overlap-free ranges and single-ACTIVE invariant per
 *   institute on top of these DTO-level checks.
 */
export class CreateAcademicYearDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({
    description:
      'Short unique code within the institute (UPPER alphanumeric / hyphenated).',
    example: 'AY-2025-26',
    minLength: 2,
    maxLength: 32,
  })
  @IsString()
  @Length(2, 32)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'code must be UPPER alphanumeric (A-Z, 0-9, _, -).',
  })
  code!: string;

  @ApiProperty({
    description: 'Human-readable academic year name.',
    example: 'Academic Year 2025-26',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiProperty({
    description: 'Start date of the academic year (ISO date).',
    example: '2025-07-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'End date of the academic year (ISO date, exclusive end ok).',
    example: '2026-06-30',
  })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    enum: AcademicYearStatus,
    default: AcademicYearStatus.PLANNED,
  })
  @IsOptional()
  @IsEnum(AcademicYearStatus)
  status?: AcademicYearStatus;

  @ApiPropertyOptional({
    description:
      'Mark this academic year as the institute-wide current year. Only one ACTIVE year is permitted per institute.',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({
    description: 'Arbitrary JSON metadata (tenant-defined).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
