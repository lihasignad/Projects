import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimetableStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateTimetableDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Term UUID.', format: 'uuid' })
  @IsUUID()
  termId!: string;

  @ApiProperty({ description: 'Section UUID.', format: 'uuid' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Timetable title/name.', example: 'CSE-3A Fall 2026 Timetable' })
  @IsString()
  @Length(1, 150)
  name!: string;

  @ApiProperty({ description: 'Effective start date (YYYY-MM-DD).' })
  @Type(() => Date)
  @IsDate()
  effectiveFrom!: Date;

  @ApiPropertyOptional({ description: 'Effective end date (YYYY-MM-DD).' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveTo?: Date;

  @ApiPropertyOptional({ enum: TimetableStatus, default: TimetableStatus.DRAFT })
  @IsOptional()
  @IsEnum(TimetableStatus)
  status?: TimetableStatus;

  @ApiPropertyOptional({ description: 'Version number.', default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({ description: 'Published timestamp.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @ApiPropertyOptional({ description: 'Publisher user UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  publishedById?: string;

  @ApiPropertyOptional({ description: 'Internal remarks or notes.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
