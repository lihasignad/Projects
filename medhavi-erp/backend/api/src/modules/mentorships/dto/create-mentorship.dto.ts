import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MentorshipStatus, MentorshipType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMentorshipDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() mentorFacultyId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiPropertyOptional({ enum: MentorshipType, default: MentorshipType.ACADEMIC }) @IsOptional() @IsEnum(MentorshipType) type?: MentorshipType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() academicYearId?: string;
  @ApiProperty() @Type(() => Date) @IsDate() startDate!: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
  @ApiPropertyOptional({ enum: MentorshipStatus, default: MentorshipStatus.REQUESTED }) @IsOptional() @IsEnum(MentorshipStatus) status?: MentorshipStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() goals?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meetingCadence?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) lastInteractionAt?: Date;
  @ApiPropertyOptional({ minimum: 0, default: 0 }) @IsOptional() @IsInt() @Min(0) interactionCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() rating?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() feedback?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedByUserId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() closedReason?: string;
  @ApiPropertyOptional({ type: 'object' }) @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
