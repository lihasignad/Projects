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
 * CreateSchoolDto
 *
 * Mirrors CreateCampusDto conventions:
 * - `code` is UPPER_SNAKE alphanumeric and unique per institute.
 * - `instituteId` + `campusId` are both required; the service verifies the
 *   campus belongs to the given institute (and is not soft-deleted).
 */
export class CreateSchoolDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Parent campus UUID (must belong to institute).', format: 'uuid' })
  @IsUUID()
  campusId!: string;

  @ApiProperty({
    description: 'Short unique code within the institute (UPPER_SNAKE).',
    example: 'SOE',
    minLength: 2,
    maxLength: 32,
  })
  @IsString()
  @Length(2, 32)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'code must be UPPER_SNAKE alphanumeric (A-Z, 0-9, _).',
  })
  code!: string;

  @ApiProperty({ description: 'Human-readable school name.', maxLength: 200 })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ description: 'Optional short name / acronym.', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  shortName?: string;

  @ApiPropertyOptional({
    description: 'UUID of the User serving as Dean (nullable).',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  deanUserId?: string;

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
