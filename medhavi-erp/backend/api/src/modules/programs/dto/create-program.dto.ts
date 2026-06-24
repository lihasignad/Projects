import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  GradingScheme,
  ProgramLevel,
  ProgramMode,
  ProgramStatus,
} from '@prisma/client';
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
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * CreateProgramDto
 *
 * Mirrors CreateDepartmentDto conventions:
 * - `code` is UPPER_SNAKE alphanumeric (plus '-') and unique per institute.
 * - `instituteId`, `schoolId`, and `departmentId` are required. `campusId` is
 *   optional on Program (schema allows null), but when provided the service
 *   verifies the school belongs to that campus.
 * - The service verifies the department belongs to the given school, the
 *   school belongs to the given campus (when provided), and the campus
 *   belongs to the given institute (and none are soft-deleted).
 */
export class CreateProgramDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({
    description:
      'Parent campus UUID (must belong to institute). Optional on Program.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  campusId?: string;

  @ApiProperty({
    description: 'Parent school UUID (must belong to institute).',
    format: 'uuid',
  })
  @IsUUID()
  schoolId!: string;

  @ApiProperty({
    description: 'Parent department UUID (must belong to school + institute).',
    format: 'uuid',
  })
  @IsUUID()
  departmentId!: string;

  @ApiProperty({
    description:
      'Short unique code within the institute (UPPER_SNAKE / hyphenated).',
    example: 'BTECH-CSE',
    minLength: 2,
    maxLength: 64,
  })
  @IsString()
  @Length(2, 64)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'code must be UPPER_SNAKE alphanumeric (A-Z, 0-9, _, -).',
  })
  code!: string;

  @ApiProperty({ description: 'Human-readable program name.', maxLength: 200 })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional short name / acronym.',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  shortName?: string;

  @ApiProperty({ enum: ProgramLevel })
  @IsEnum(ProgramLevel)
  level!: ProgramLevel;

  @ApiPropertyOptional({ enum: ProgramMode, default: ProgramMode.FULL_TIME })
  @IsOptional()
  @IsEnum(ProgramMode)
  mode?: ProgramMode;

  @ApiProperty({
    description: 'Duration in years (decimal, e.g. 3, 3.5, 4).',
    example: 4,
    minimum: 0.5,
    maximum: 10,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.5)
  @Max(10)
  durationYears!: number;

  @ApiProperty({
    description: 'Total terms / semesters across the full program.',
    example: 8,
    minimum: 1,
    maximum: 24,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  totalTerms!: number;

  @ApiProperty({
    description: 'Total credits required to complete the program.',
    minimum: 1,
    maximum: 1000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  totalCredits!: number;

  @ApiPropertyOptional({
    description: 'Minimum credits required to pass / graduate.',
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  minPassCredits?: number;

  @ApiPropertyOptional({ enum: GradingScheme, default: GradingScheme.CGPA_10 })
  @IsOptional()
  @IsEnum(GradingScheme)
  gradingScheme?: GradingScheme;

  @ApiProperty({
    description: 'Annual intake capacity (seats).',
    minimum: 1,
    maximum: 100000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  intakeCapacity!: number;

  @ApiPropertyOptional({ description: 'Long-form program description.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Accreditation reference (e.g. NAAC, NBA tier).',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  accreditation?: string;

  @ApiProperty({
    description: 'Date from which this program version is effective (ISO date).',
    example: '2025-07-01',
  })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({
    description: 'Date until which this program version is effective (ISO date).',
    example: '2030-06-30',
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ enum: ProgramStatus, default: ProgramStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @ApiPropertyOptional({
    description: 'Arbitrary JSON metadata (tenant-defined).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
