import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HostelAllocationStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateHostelAllocationDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Hostel UUID.', format: 'uuid' })
  @IsUUID()
  hostelId!: string;

  @ApiProperty({ description: 'Hostel room UUID.', format: 'uuid' })
  @IsUUID()
  hostelRoomId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Academic year UUID.', format: 'uuid' })
  @IsUUID()
  academicYearId!: string;

  @ApiPropertyOptional({ description: 'Bed number.' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  bedNumber?: string;

  @ApiPropertyOptional({ description: 'Allocation status.', enum: HostelAllocationStatus })
  @IsOptional()
  @IsEnum(HostelAllocationStatus)
  status?: HostelAllocationStatus;

  @ApiPropertyOptional({ description: 'Allocating user UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  allocatedByUserId?: string;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

}
