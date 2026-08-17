import { ApiPropertyOptional } from '@nestjs/swagger';
import { LabType, Prisma } from '@prisma/client';
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

const SORTABLE_FIELDS = ['createdAt', 'code', 'name', 'capacity'] as const;
export type LabSortField = (typeof SORTABLE_FIELDS)[number];

export class ListLabsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by campus UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  campusId?: string;

  @ApiPropertyOptional({ enum: LabType })
  @IsOptional()
  @IsEnum(LabType)
  type?: LabType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true'
      ? true
      : value === false || value === 'false'
        ? false
        : value,
  )
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Case-insensitive search on code or name.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted labs.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'code' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: LabSortField = 'code';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
