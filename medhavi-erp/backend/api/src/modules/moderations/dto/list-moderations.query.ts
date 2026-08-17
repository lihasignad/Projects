import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'moderatedAt'] as const;
export type ModerationSortField = (typeof SORTABLE_FIELDS)[number];

export class ListModerationsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() marksEntryId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() moderatorUserId?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'moderatedAt' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: ModerationSortField = 'moderatedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'desc';
}
