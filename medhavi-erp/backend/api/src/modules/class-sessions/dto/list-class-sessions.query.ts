import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClassSessionStatus, DeliveryMode, Prisma, TimetableEntryType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
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

const SORTABLE_FIELDS = ['createdAt', 'sessionDate', 'startAt'] as const;
export type ClassSessionSortField = (typeof SORTABLE_FIELDS)[number];

export class ListClassSessionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by timetable entry UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  timetableEntryId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject offering UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiPropertyOptional({ description: 'Filter by faculty UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Filter by section UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'Filter by room UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Filter by lab UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  labId?: string;

  @ApiPropertyOptional({ description: 'Filter by calendar date.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  sessionDate?: Date;

  @ApiPropertyOptional({ enum: ClassSessionStatus })
  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @ApiPropertyOptional({ enum: TimetableEntryType })
  @IsOptional()
  @IsEnum(TimetableEntryType)
  entryType?: TimetableEntryType;

  @ApiPropertyOptional({ enum: DeliveryMode })
  @IsOptional()
  @IsEnum(DeliveryMode)
  deliveryMode?: DeliveryMode;

  @ApiPropertyOptional({ description: 'Case-insensitive search on topic or summary.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted class sessions.',
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
  sortBy?: ClassSessionSortField = 'sessionDate';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'desc';
}
