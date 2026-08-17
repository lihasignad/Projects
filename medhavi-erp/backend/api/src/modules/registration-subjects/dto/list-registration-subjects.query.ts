import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, RegistrationSubjectStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'addedAt', 'credits'] as const;
export type RegistrationSubjectSortField = (typeof SORTABLE_FIELDS)[number];

export class ListRegistrationSubjectsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() registrationId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() subjectOfferingId?: string;
  @ApiPropertyOptional({ enum: RegistrationSubjectStatus }) @IsOptional() @IsEnum(RegistrationSubjectStatus) status?: RegistrationSubjectStatus;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() isElective?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() isAudit?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: RegistrationSubjectSortField = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'desc';
}
