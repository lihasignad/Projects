import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, FeeStructureStatus } from '@prisma/client';
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

const SORTABLE_FIELDS = ['createdAt', 'name', 'totalAmount'] as const;
export type FeeStructuresSortField = (typeof SORTABLE_FIELDS)[number];

export class ListFeeStructuresQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by program.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiPropertyOptional({ description: 'Filter by batch.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({ description: 'Filter by academic year.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiPropertyOptional({ description: 'Filter by status.', enum: FeeStructureStatus })
  @IsOptional()
  @IsEnum(FeeStructureStatus)
  status?: FeeStructureStatus;

  @ApiPropertyOptional({ description: 'Case-insensitive search.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ description: 'Include soft-deleted records.', default: false })
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'name' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: FeeStructuresSortField = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
