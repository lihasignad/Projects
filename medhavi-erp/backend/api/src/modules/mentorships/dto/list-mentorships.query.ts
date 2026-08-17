import { ApiPropertyOptional } from '@nestjs/swagger';
import { MentorshipStatus, MentorshipType, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['createdAt', 'startDate', 'rating'] as const;
export type MentorshipSortField = (typeof SORTABLE_FIELDS)[number];

export class ListMentorshipsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() instituteId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() mentorFacultyId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() studentId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() academicYearId?: string;
  @ApiPropertyOptional({ enum: MentorshipType }) @IsOptional() @IsEnum(MentorshipType) type?: MentorshipType;
  @ApiPropertyOptional({ enum: MentorshipStatus }) @IsOptional() @IsEnum(MentorshipStatus) status?: MentorshipStatus;
  @ApiPropertyOptional({ default: false }) @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() includeDeleted?: boolean;
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'startDate' }) @IsOptional() @IsIn(SORTABLE_FIELDS as unknown as string[]) sortBy?: MentorshipSortField = 'startDate';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: Prisma.SortOrder = 'desc';
}
