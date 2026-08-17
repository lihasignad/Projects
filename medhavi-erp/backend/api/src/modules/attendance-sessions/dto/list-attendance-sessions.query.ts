import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceMethod, AttendanceSessionStatus, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'sessionDate', 'status'] as const;
export type AttendanceSessionSortField = (typeof SORTABLE_FIELDS)[number];

export class ListAttendanceSessionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by class session UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  classSessionId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject offering UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiPropertyOptional({ description: 'Filter by section UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'Filter by faculty UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Filter by session date.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  sessionDate?: Date;

  @ApiPropertyOptional({ enum: AttendanceSessionStatus })
  @IsOptional()
  @IsEnum(AttendanceSessionStatus)
  status?: AttendanceSessionStatus;

  @ApiPropertyOptional({ enum: AttendanceMethod })
  @IsOptional()
  @IsEnum(AttendanceMethod)
  method?: AttendanceMethod;

  @ApiPropertyOptional({
    description: 'Include soft-deleted attendance sessions.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'sessionDate' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: AttendanceSessionSortField = 'sessionDate';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
