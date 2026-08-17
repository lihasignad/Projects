import { ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, DeliveryMode, Prisma, TimetableEntryType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'dayOfWeek'] as const;
export type TimetableEntrySortField = (typeof SORTABLE_FIELDS)[number];

export class ListTimetableEntriesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by institute UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Filter by timetable UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  timetableId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject offering UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiPropertyOptional({ description: 'Filter by primary faculty UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  primaryFacultyId?: string;

  @ApiPropertyOptional({ description: 'Filter by room UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Filter by lab UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  labId?: string;

  @ApiPropertyOptional({ description: 'Filter by time slot UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  timeSlotId?: string;

  @ApiPropertyOptional({ enum: DayOfWeek })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({ enum: TimetableEntryType })
  @IsOptional()
  @IsEnum(TimetableEntryType)
  entryType?: TimetableEntryType;

  @ApiPropertyOptional({ enum: DeliveryMode })
  @IsOptional()
  @IsEnum(DeliveryMode)
  deliveryMode?: DeliveryMode;

  @ApiPropertyOptional({
    description: 'Include soft-deleted timetable entries.',
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

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'dayOfWeek' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: TimetableEntrySortField = 'dayOfWeek';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: Prisma.SortOrder = 'asc';
}
