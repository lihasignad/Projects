import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, ResearchProjectStatus } from '@prisma/client';
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

const SORTABLE_FIELDS = ['createdAt', 'title', 'status', 'startDate'] as const;
export type ResearchProjectsSortField = (typeof SORTABLE_FIELDS)[number];

export class ListResearchProjectsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by department.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by PI.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  principalInvestigatorFacultyId?: string;

  @ApiPropertyOptional({ description: 'Filter by status.', enum: ResearchProjectStatus })
  @IsOptional()
  @IsEnum(ResearchProjectStatus)
  status?: ResearchProjectStatus;

  @ApiPropertyOptional({ description: 'Filter by domain.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  domain?: string;

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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: ResearchProjectsSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
