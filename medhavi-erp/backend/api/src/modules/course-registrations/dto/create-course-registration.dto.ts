import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseRegistrationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCourseRegistrationDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() cycleId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() termId!: string;
  @ApiPropertyOptional({ enum: CourseRegistrationStatus, default: CourseRegistrationStatus.DRAFT }) @IsOptional() @IsEnum(CourseRegistrationStatus) status?: CourseRegistrationStatus;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() totalCredits?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) submittedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) advisorApprovedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() advisorUserId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) hodApprovedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() hodUserId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rejectedReason?: string;
}
