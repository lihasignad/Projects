import { ApiPropertyOptional } from '@nestjs/swagger';
import { MarksEntryStatus, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'submittedAt', 'approvedAt'] as const;
export type MarksEntrySortField = (typeof SORTABLE_FIELDS)[number];

export class ListMarksEntriesQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() examId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() subjectOfferingId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() enteredByFacultyId?: string;
  @ApiPropertyOptional({ enum: MarksEntryStatus }) @IsOptional() @IsEnum(MarksEntryStatus) status?: MarksEntryStatus;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: MarksEntrySortField = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'desc';
}
