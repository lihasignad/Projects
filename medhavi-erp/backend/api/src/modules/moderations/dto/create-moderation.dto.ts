import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateModerationDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() marksEntryId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() moderatorUserId!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() scalingFactor?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() graceMarks?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cutoffAdjustment?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() rationale?: string;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() beforeStatsJson?: Record<string, unknown>;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() afterStatsJson?: Record<string, unknown>;
}
