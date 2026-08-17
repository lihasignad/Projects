import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationCycleStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateRegistrationCycleDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() termId!: string;
  @ApiProperty({ example: 'Fall 2026 Regular Registration' }) @IsString() @Length(1, 150) name!: string;
  @ApiProperty() @Type(() => Date) @IsDate() opensAt!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() closesAt!: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() addDropClosesAt?: Date;
  @ApiPropertyOptional({ enum: RegistrationCycleStatus, default: RegistrationCycleStatus.PLANNED }) @IsOptional() @IsEnum(RegistrationCycleStatus) status?: RegistrationCycleStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minCredits?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxCredits?: number;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() rulesJson?: Record<string, unknown>;
}
