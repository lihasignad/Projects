import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveRequestStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateHostelLeaveRequestDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Hostel UUID.', format: 'uuid' })
  @IsUUID()
  hostelId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Leave start date.' })
  @IsDateString()
  fromDate!: string;

  @ApiProperty({ description: 'Leave end date.' })
  @IsDateString()
  toDate!: string;

  @ApiProperty({ description: 'Reason for leave.' })
  @IsString()
  @MaxLength(1000)
  reason!: string;

  @ApiPropertyOptional({ description: 'Destination.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @ApiPropertyOptional({ description: 'Emergency contact.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Request status.', enum: LeaveRequestStatus })
  @IsOptional()
  @IsEnum(LeaveRequestStatus)
  status?: LeaveRequestStatus;

}
