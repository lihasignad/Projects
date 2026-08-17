import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassSessionStatus, DeliveryMode, TimetableEntryType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateClassSessionDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Timetable entry UUID if generated from schedule.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  timetableEntryId?: string;

  @ApiProperty({ description: 'Subject offering UUID.', format: 'uuid' })
  @IsUUID()
  subjectOfferingId!: string;

  @ApiProperty({ description: 'Faculty UUID conducting the session.', format: 'uuid' })
  @IsUUID()
  facultyId!: string;

  @ApiProperty({ description: 'Section UUID.', format: 'uuid' })
  @IsUUID()
  sectionId!: string;

  @ApiPropertyOptional({ description: 'Room UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Lab UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  labId?: string;

  @ApiProperty({ description: 'Session calendar date (YYYY-MM-DD).' })
  @Type(() => Date)
  @IsDate()
  sessionDate!: Date;

  @ApiProperty({ description: 'Start timestamp.' })
  @Type(() => Date)
  @IsDate()
  startAt!: Date;

  @ApiProperty({ description: 'End timestamp.' })
  @Type(() => Date)
  @IsDate()
  endAt!: Date;

  @ApiProperty({ enum: TimetableEntryType, default: TimetableEntryType.LECTURE })
  @IsEnum(TimetableEntryType)
  entryType!: TimetableEntryType;

  @ApiPropertyOptional({ enum: DeliveryMode, default: DeliveryMode.OFFLINE })
  @IsOptional()
  @IsEnum(DeliveryMode)
  deliveryMode?: DeliveryMode;

  @ApiPropertyOptional({ enum: ClassSessionStatus, default: ClassSessionStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @ApiPropertyOptional({ description: 'Topic planned for this class.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  topic?: string;

  @ApiPropertyOptional({ description: 'Summary of what was covered.' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation if cancelled.' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiPropertyOptional({ description: 'Rescheduled session UUID if rescheduled.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  rescheduledToId?: string;

  @ApiPropertyOptional({ description: 'Online meeting URL.' })
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;

  @ApiPropertyOptional({ description: 'Online meeting recording link.' })
  @IsOptional()
  @IsUrl()
  meetingRecordingUrl?: string;
}
