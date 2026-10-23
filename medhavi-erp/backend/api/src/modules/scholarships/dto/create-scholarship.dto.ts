import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScholarshipStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateScholarshipDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Academic year UUID.', format: 'uuid' })
  @IsUUID()
  academicYearId!: string;

  @ApiProperty({ description: 'Scholarship name.' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Sponsoring body.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sponsor?: string;

  @ApiProperty({ description: 'Scholarship amount.' })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Scholarship status.', enum: ScholarshipStatus })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  status?: ScholarshipStatus;

  @ApiPropertyOptional({ description: 'Disbursement method.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  disbursementMethod?: string;

  @ApiPropertyOptional({ description: 'Supporting documents.' })
  @IsOptional()
  @IsObject()
  documentsJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Remarks.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;

}
