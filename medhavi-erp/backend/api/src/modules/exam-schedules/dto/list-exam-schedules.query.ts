import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExamScheduleStatus, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'examDate', 'startTime'] as const;
export type ExamScheduleSortField = (typeof SORTABLE_FIELDS)[number];

export class ListExamSchedulesQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() examId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() subjectOfferingId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() roomId?: string;
  @ApiPropertyOptional({ enum: ExamScheduleStatus }) @IsOptional() @IsEnum(ExamScheduleStatus) status?: ExamScheduleStatus;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'examDate' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: ExamScheduleSortField = 'examDate';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'asc';
}
