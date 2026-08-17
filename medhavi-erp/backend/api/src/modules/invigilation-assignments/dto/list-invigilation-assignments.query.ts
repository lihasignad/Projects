import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvigilationRole, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'reportingAt'] as const;
export type InvigilationAssignmentSortField = (typeof SORTABLE_FIELDS)[number];

export class ListInvigilationAssignmentsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() examScheduleId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() facultyId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() roomId?: string;
  @ApiPropertyOptional({ enum: InvigilationRole }) @IsOptional() @IsEnum(InvigilationRole) role?: InvigilationRole;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() acknowledged?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'reportingAt' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: InvigilationAssignmentSortField = 'reportingAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'asc';
}
