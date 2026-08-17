import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFacultyWorkloadDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() facultyId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() termId!: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() lectureHoursPlanned?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() labHoursPlanned?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() tutorialHoursPlanned?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() otherHoursPlanned?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() totalHoursPlanned?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() lectureHoursActual?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() labHoursActual?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() tutorialHoursActual?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() otherHoursActual?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() totalHoursActual?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxHoursAllowed?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) lastRecalculatedAt?: Date;
}
