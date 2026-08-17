import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamScheduleStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateExamScheduleDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() examId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() subjectOfferingId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() roomId?: string;
  @ApiProperty() @Type(() => Date) @IsDate() examDate!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() startTime!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() endTime!: Date;
  @ApiProperty({ minimum: 1 }) @IsInt() @Min(1) durationMin!: number;
  @ApiProperty() @IsNumber() maxMarks!: number;
  @ApiProperty() @IsNumber() passingMarks!: number;
  @ApiPropertyOptional({ enum: ExamScheduleStatus }) @IsOptional() @IsEnum(ExamScheduleStatus) status?: ExamScheduleStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
