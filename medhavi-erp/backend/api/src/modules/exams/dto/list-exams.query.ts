import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExamStatus, ExamType, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'startDate', 'endDate', 'name', 'code'] as const;
export type ExamSortField = (typeof SORTABLE_FIELDS)[number];

export class ListExamsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() termId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() programId?: string;
  @ApiPropertyOptional({ enum: ExamType }) @IsOptional() @IsEnum(ExamType) type?: ExamType;
  @ApiPropertyOptional({ enum: ExamStatus }) @IsOptional() @IsEnum(ExamStatus) status?: ExamStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) search?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'startDate' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: ExamSortField = 'startDate';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'desc';
}
