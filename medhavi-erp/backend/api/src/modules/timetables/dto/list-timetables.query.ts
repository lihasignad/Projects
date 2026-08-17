import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, TimetableStatus } from '@prisma/client';
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

const SORTABLE_FIELDS = ['createdAt', 'effectiveFrom', 'version', 'name'] as const;
export type TimetableSortField = (typeof SORTABLE_FIELDS)[number];

export class ListTimetablesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by term UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  termId?: string;

  @ApiPropertyOptional({ description: 'Filter by section UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({ enum: TimetableStatus })
  @IsOptional()
  @IsEnum(TimetableStatus)
  status?: TimetableStatus;

  @ApiPropertyOptional({ description: 'Case-insensitive search on timetable name.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted timetables.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: TimetableSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
