import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgUnitStatus } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * CreateDepartmentDto
 *
 * Mirrors CreateSchoolDto conventions:
 * - `code` is UPPER_SNAKE alphanumeric and unique per institute (and per school).
 * - `instituteId`, `campusId`, and `schoolId` are all required. The service
 *   verifies the school belongs to the given campus and institute, and that
 *   the campus belongs to the given institute (and none are soft-deleted).
 */
export class CreateDepartmentDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({
    description: 'Parent campus UUID (must belong to institute).',
    format: 'uuid',
  })
  @IsUUID()
  campusId!: string;

  @ApiProperty({
    description: 'Parent school UUID (must belong to campus + institute).',
    format: 'uuid',
  })
  @IsUUID()
  schoolId!: string;

  @ApiProperty({
    description: 'Short unique code within the institute (UPPER_SNAKE).',
    example: 'CSE',
    minLength: 2,
    maxLength: 32,
  })
  @IsString()
  @Length(2, 32)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'code must be UPPER_SNAKE alphanumeric (A-Z, 0-9, _).',
  })
  code!: string;

  @ApiProperty({ description: 'Human-readable department name.', maxLength: 200 })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ description: 'Optional short name / acronym.', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  shortName?: string;

  @ApiPropertyOptional({
    description: 'UUID of the User serving as Head of Department (nullable).',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  hodUserId?: string;

  @ApiPropertyOptional({ enum: OrgUnitStatus, default: OrgUnitStatus.ACTIVE })
  @IsOptional()
  @IsEnum(OrgUnitStatus)
  status?: OrgUnitStatus;

  @ApiPropertyOptional({
    description: 'Arbitrary JSON metadata (tenant-defined).',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
