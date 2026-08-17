import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceMethod, AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAttendanceRecordDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Attendance session UUID.', format: 'uuid' })
  @IsUUID()
  attendanceSessionId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Timestamp when marked.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  markedAt?: Date;

  @ApiPropertyOptional({ description: 'User UUID who marked attendance.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  markedByUserId?: string;

  @ApiPropertyOptional({ enum: AttendanceMethod })
  @IsOptional()
  @IsEnum(AttendanceMethod)
  method?: AttendanceMethod;

  @ApiPropertyOptional({ description: 'Optional remark or excuse reason.' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate of check-in.' })
  @IsOptional()
  @IsNumber()
  geoLat?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate of check-in.' })
  @IsOptional()
  @IsNumber()
  geoLng?: number;

  @ApiPropertyOptional({ description: 'Device fingerprint hash.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceFingerprint?: string;

  @ApiPropertyOptional({ description: 'Client IP address.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  ipAddress?: string;
}
