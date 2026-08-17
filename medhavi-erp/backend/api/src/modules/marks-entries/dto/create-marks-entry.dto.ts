import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarksEntryStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMarksEntryDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() examId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() subjectOfferingId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() enteredByFacultyId!: string;
  @ApiPropertyOptional({ enum: MarksEntryStatus, default: MarksEntryStatus.DRAFT }) @IsOptional() @IsEnum(MarksEntryStatus) status?: MarksEntryStatus;
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) totalStudents!: number;
  @ApiPropertyOptional({ minimum: 0, default: 0 }) @IsOptional() @IsInt() @Min(0) enteredCount?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) submittedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) approvedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() approvedByUserId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() filePath?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
