import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateTranscriptDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() termId?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isCumulative?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCreditsEarned?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sgpa?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cgpa?: number;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @IsInt() @Min(1) rank?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() classification?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) issuedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() issuedByUserId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() fileObjectId?: string;
  @ApiProperty() @IsString() verificationCode!: string;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() payloadJson?: Record<string, unknown>;
}
