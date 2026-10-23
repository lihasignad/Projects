import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStage } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePlacementApplicationDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Placement drive UUID.', format: 'uuid' })
  @IsUUID()
  driveId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Application stage.', enum: ApplicationStage })
  @IsOptional()
  @IsEnum(ApplicationStage)
  stage?: ApplicationStage;

  @ApiPropertyOptional({ description: 'Resume file UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  resumeFileObjectId?: string;

  @ApiPropertyOptional({ description: 'Cover letter.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  coverLetter?: string;

  @ApiPropertyOptional({ description: 'Test scores.' })
  @IsOptional()
  @IsObject()
  testScoresJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

}
