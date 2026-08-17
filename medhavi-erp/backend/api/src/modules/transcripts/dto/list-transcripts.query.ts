import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'issuedAt', 'cgpa', 'sgpa'] as const;
export type TranscriptSortField = (typeof SORTABLE_FIELDS)[number];

export class ListTranscriptsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() studentId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() termId?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() isCumulative?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) verificationCode?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'issuedAt' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: TranscriptSortField = 'issuedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'desc';
}
