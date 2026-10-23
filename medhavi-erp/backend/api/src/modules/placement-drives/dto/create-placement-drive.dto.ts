import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriveType, DriveStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlacementDriveDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Company UUID.', format: 'uuid' })
  @IsUUID()
  companyId!: string;

  @ApiProperty({ description: 'Academic year UUID.', format: 'uuid' })
  @IsUUID()
  academicYearId!: string;

  @ApiProperty({ description: 'Drive title.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ description: 'Drive type.', enum: DriveType })
  @IsEnum(DriveType)
  type!: DriveType;

  @ApiPropertyOptional({ description: 'Drive status.', enum: DriveStatus })
  @IsOptional()
  @IsEnum(DriveStatus)
  status?: DriveStatus;

  @ApiProperty({ description: 'Job role.' })
  @IsString()
  @MaxLength(200)
  jobRole!: string;

  @ApiPropertyOptional({ description: 'Job description.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  jobDescription?: string;

  @ApiPropertyOptional({ description: 'Minimum CTC.' })
  @IsOptional()
  @IsNumber()
  ctcMin?: number;

  @ApiPropertyOptional({ description: 'Maximum CTC.' })
  @IsOptional()
  @IsNumber()
  ctcMax?: number;

  @ApiPropertyOptional({ description: 'Stipend.' })
  @IsOptional()
  @IsNumber()
  stipend?: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Job locations.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @ApiPropertyOptional({ description: 'Bond years.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  bondYears?: number;

  @ApiPropertyOptional({ description: 'Eligibility criteria.' })
  @IsOptional()
  @IsObject()
  eligibilityJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Minimum CGPA.' })
  @IsOptional()
  @IsNumber()
  minCgpa?: number;

  @ApiPropertyOptional({ description: 'Max allowed backlogs.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxBacklogs?: number;

  @ApiPropertyOptional({ description: 'Eligible programs.' })
  @IsOptional()
  @IsObject()
  eligibleProgramsJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Registration opens.' })
  @IsOptional()
  @IsDateString()
  registrationOpensAt?: string;

  @ApiPropertyOptional({ description: 'Registration closes.' })
  @IsOptional()
  @IsDateString()
  registrationClosesAt?: string;

  @ApiPropertyOptional({ description: 'Drive date.' })
  @IsOptional()
  @IsDateString()
  driveDate?: string;

  @ApiPropertyOptional({ description: 'Total seats.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalSeats?: number;

  @ApiPropertyOptional({ description: 'Coordinator user UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  coordinatorUserId?: string;

}
