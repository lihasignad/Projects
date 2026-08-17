import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvigilationRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInvigilationAssignmentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() examScheduleId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() facultyId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() roomId?: string;
  @ApiPropertyOptional({ enum: InvigilationRole, default: InvigilationRole.ASSISTANT }) @IsOptional() @IsEnum(InvigilationRole) role?: InvigilationRole;
  @ApiProperty() @Type(() => Date) @IsDate() reportingAt!: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() releasedAt?: Date;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() acknowledged?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() acknowledgedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
