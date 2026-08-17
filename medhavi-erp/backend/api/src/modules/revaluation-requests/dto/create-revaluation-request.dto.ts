import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevaluationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRevaluationRequestDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() examId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() resultId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiProperty() @IsString() reason!: string;
  @ApiPropertyOptional({ enum: RevaluationStatus, default: RevaluationStatus.REQUESTED }) @IsOptional() @IsEnum(RevaluationStatus) status?: RevaluationStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() feeAmount?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) feePaidAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() invoiceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() oldMarks?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() newMarks?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) decidedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() decidedByUserId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
