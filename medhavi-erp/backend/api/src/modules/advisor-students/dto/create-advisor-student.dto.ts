import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdvisorAssignmentStatus, AdvisorRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAdvisorStudentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() facultyAdvisorId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() advisorFacultyId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiPropertyOptional({ enum: AdvisorRole, default: AdvisorRole.PROGRAM_ADVISOR }) @IsOptional() @IsEnum(AdvisorRole) role?: AdvisorRole;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() academicYearId?: string;
  @ApiProperty() @Type(() => Date) @IsDate() startDate!: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
  @ApiPropertyOptional({ enum: AdvisorAssignmentStatus, default: AdvisorAssignmentStatus.ACTIVE }) @IsOptional() @IsEnum(AdvisorAssignmentStatus) status?: AdvisorAssignmentStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedByUserId?: string;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
