import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseEnrollmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCourseEnrollmentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() courseId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) enrolledAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) completedAt?: Date;
  @ApiPropertyOptional({ enum: CourseEnrollmentStatus, default: CourseEnrollmentStatus.ENROLLED }) @IsOptional() @IsEnum(CourseEnrollmentStatus) status?: CourseEnrollmentStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() progressPct?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) lastAccessedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() grade?: string;
}
