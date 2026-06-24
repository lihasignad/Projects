import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrgUnitStatus, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'name', 'code'] as const;
export type SchoolSortField = (typeof SORTABLE_FIELDS)[number];

/**
 * ListSchoolsQueryDto
 *
 * Mirrors ListCampusesQueryDto: offset pagination, free-text `search`
 * against name/code/shortName, plus filters and sort controls.
 */
export class ListSchoolsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by parent institute UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by parent campus UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  campusId?: string;

  @ApiPropertyOptional({ enum: OrgUnitStatus })
  @IsOptional()
  @IsEnum(OrgUnitStatus)
  status?: OrgUnitStatus;

  @ApiPropertyOptional({ description: 'Case-insensitive substring match on name, code, or shortName.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted schools in the result set.',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true' ? true : value === false || value === 'false' ? false : value,
  )
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: SchoolSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
