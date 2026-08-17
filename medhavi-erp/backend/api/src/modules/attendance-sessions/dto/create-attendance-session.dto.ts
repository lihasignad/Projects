import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceMethod, AttendanceSessionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAttendanceSessionDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Class session UUID.', format: 'uuid' })
  @IsUUID()
  classSessionId!: string;

  @ApiProperty({ description: 'Subject offering UUID.', format: 'uuid' })
  @IsUUID()
  subjectOfferingId!: string;

  @ApiProperty({ description: 'Section UUID.', format: 'uuid' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Faculty UUID who conducted the session.', format: 'uuid' })
  @IsUUID()
  facultyId!: string;

  @ApiProperty({ description: 'Session date (YYYY-MM-DD).' })
  @Type(() => Date)
  @IsDate()
  sessionDate!: Date;

  @ApiPropertyOptional({ description: 'Timestamp when attendance opened.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  openedAt?: Date;

  @ApiPropertyOptional({ description: 'Timestamp when attendance closed.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  closedAt?: Date;

  @ApiPropertyOptional({ enum: AttendanceMethod, default: AttendanceMethod.MANUAL })
  @IsOptional()
  @IsEnum(AttendanceMethod)
  method?: AttendanceMethod;

  @ApiPropertyOptional({ enum: AttendanceSessionStatus, default: AttendanceSessionStatus.OPEN })
  @IsOptional()
  @IsEnum(AttendanceSessionStatus)
  status?: AttendanceSessionStatus;

  @ApiPropertyOptional({ description: 'Dynamic QR token for scanner verification.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  qrToken?: string;

  @ApiPropertyOptional({ description: 'QR expiration time.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  qrExpiresAt?: Date;

  @ApiPropertyOptional({ description: 'Latitude coordinate for geofencing.' })
  @IsOptional()
  @IsNumber()
  geoLat?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate for geofencing.' })
  @IsOptional()
  @IsNumber()
  geoLng?: number;

  @ApiPropertyOptional({ description: 'Geofence radius in meters.', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  geoRadiusM?: number;

  @ApiPropertyOptional({ description: 'Optional session notes.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
