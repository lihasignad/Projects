import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationSubjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRegistrationSubjectDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() registrationId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() subjectOfferingId!: string;
  @ApiPropertyOptional({ enum: RegistrationSubjectStatus, default: RegistrationSubjectStatus.ADDED }) @IsOptional() @IsEnum(RegistrationSubjectStatus) status?: RegistrationSubjectStatus;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isElective?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isAudit?: boolean;
  @ApiProperty() @IsNumber() credits!: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() preferenceOrder?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) addedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) droppedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
