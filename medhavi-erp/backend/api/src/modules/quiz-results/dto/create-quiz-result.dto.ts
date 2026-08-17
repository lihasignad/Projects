import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsObject, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateQuizResultDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() attemptId!: string;
  @ApiProperty() @IsNumber() marksAwarded!: number;
  @ApiProperty() @IsNumber() totalMarks!: number;
  @ApiProperty() @IsNumber() percentage!: number;
  @ApiProperty() @IsBoolean() passed!: boolean;
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) correctCount!: number;
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) incorrectCount!: number;
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) unansweredCount!: number;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() perQuestionJson?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) gradedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() gradedByUserId?: string;
}
