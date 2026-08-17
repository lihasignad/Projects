import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultGradeOutcome, ResultStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() examId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() subjectOfferingId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() marksObtained?: number;
  @ApiProperty() @IsNumber() maxMarks!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() percentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() gradePoint?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() gradeLetter?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() credits?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() creditPoints?: number;
  @ApiPropertyOptional({ enum: ResultGradeOutcome, default: ResultGradeOutcome.PENDING }) @IsOptional() @IsEnum(ResultGradeOutcome) outcome?: ResultGradeOutcome;
  @ApiPropertyOptional({ enum: ResultStatus, default: ResultStatus.COMPUTED }) @IsOptional() @IsEnum(ResultStatus) status?: ResultStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) publishedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) revisedAt?: Date;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isMakeup?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() remark?: string;
}
