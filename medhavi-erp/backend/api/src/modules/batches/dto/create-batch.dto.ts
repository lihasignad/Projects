import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BatchStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

/**
 * CreateBatchDto
 *
 * Mirrors CreateProgramDto conventions:
 * - `code` is UPPER_SNAKE alphanumeric (plus '-') and unique per program.
 * - `instituteId`, `programId`, and `academicYearId` are required. The service
 *   verifies the program and academic year both belong to the institute and
 *   are not soft-deleted.
 *
 * Field names match the Prisma `Batch` model exactly (intakeYear /
 * expectedGradYear / sanctionedSeats / filledSeats / currentTermSeq).
 */
export class CreateBatchDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({
    description: 'Parent program UUID (must belong to institute).',
    format: 'uuid',
  })
  @IsUUID()
  programId!: string;

  @ApiProperty({
    description: 'Parent academic year UUID (must belong to institute).',
    format: 'uuid',
  })
  @IsUUID()
  academicYearId!: string;

  @ApiProperty({
    description:
      'Short unique code within the program (UPPER_SNAKE / hyphenated).',
    example: 'BTECH-CSE-2025',
    minLength: 2,
    maxLength: 64,
  })
  @IsString()
  @Length(2, 64)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'code must be UPPER_SNAKE alphanumeric (A-Z, 0-9, _, -).',
  })
  code!: string;

  @ApiProperty({ description: 'Human-readable batch name.', maxLength: 200 })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({
    description: 'Year of admission / intake.',
    example: 2025,
    minimum: 1900,
    maximum: 2100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  intakeYear!: number;

  @ApiProperty({
    description: 'Expected year of graduation.',
    example: 2029,
    minimum: 1900,
    maximum: 2100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  expectedGradYear!: number;

  @ApiProperty({
    description: 'Batch start date (ISO date).',
    example: '2025-08-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Batch end date (ISO date).',
    example: '2029-06-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Sanctioned (intake) seats for the batch.',
    minimum: 0,
    maximum: 100000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  sanctionedSeats!: number;

  @ApiPropertyOptional({
    description: 'Currently filled seats (defaults to 0).',
    minimum: 0,
    maximum: 100000,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  filledSeats?: number;

  @ApiPropertyOptional({
    description: 'Current term sequence (1-based) the batch is progressing in.',
    minimum: 1,
    maximum: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  currentTermSeq?: number;

  @ApiPropertyOptional({ enum: BatchStatus, default: BatchStatus.UPCOMING })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional({
    description: 'Arbitrary JSON metadata (tenant-defined).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
