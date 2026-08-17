import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, DeliveryMode, TimetableEntryType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTimetableEntryDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Timetable UUID.', format: 'uuid' })
  @IsUUID()
  timetableId!: string;

  @ApiProperty({ description: 'Subject offering UUID.', format: 'uuid' })
  @IsUUID()
  subjectOfferingId!: string;

  @ApiPropertyOptional({ description: 'Faculty assignment UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  facultyAssignmentId?: string;

  @ApiProperty({ description: 'Primary faculty UUID.', format: 'uuid' })
  @IsUUID()
  primaryFacultyId!: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MON })
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ description: 'Time slot UUID.', format: 'uuid' })
  @IsUUID()
  timeSlotId!: string;

  @ApiPropertyOptional({ description: 'Room UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Lab UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  labId?: string;

  @ApiProperty({ enum: TimetableEntryType, default: TimetableEntryType.LECTURE })
  @IsEnum(TimetableEntryType)
  entryType!: TimetableEntryType;

  @ApiPropertyOptional({ enum: DeliveryMode, default: DeliveryMode.OFFLINE })
  @IsOptional()
  @IsEnum(DeliveryMode)
  deliveryMode?: DeliveryMode;

  @ApiPropertyOptional({ description: 'Virtual meeting URL.' })
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;

  @ApiPropertyOptional({ description: 'Week parity (ODD / EVEN / ALL).', example: 'ALL' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  weekParity?: string;

  @ApiPropertyOptional({ description: 'Optional entry notes.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
