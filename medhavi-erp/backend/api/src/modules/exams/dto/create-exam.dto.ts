import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamStatus, ExamType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() termId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() programId?: string;
  @ApiProperty({ example: 'End Term Examination 2026' }) @IsString() @Length(2, 200) name!: string;
  @ApiProperty({ example: 'END-TERM-2026' }) @IsString() @Length(2, 50) code!: string;
  @ApiProperty({ enum: ExamType }) @IsEnum(ExamType) type!: ExamType;
  @ApiPropertyOptional({ enum: ExamStatus }) @IsOptional() @IsEnum(ExamStatus) status?: ExamStatus;
  @ApiProperty() @Type(() => Date) @IsDate() startDate!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() endDate!: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() resultPublishedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() controllerUserId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
