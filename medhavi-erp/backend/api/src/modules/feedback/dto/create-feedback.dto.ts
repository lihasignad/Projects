import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackTargetType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Submitter user UUID.', format: 'uuid' })
  @IsUUID()
  submittedByUserId!: string;

  @ApiPropertyOptional({ description: 'Student UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'Target type.', enum: FeedbackTargetType })
  @IsEnum(FeedbackTargetType)
  targetType!: FeedbackTargetType;

  @ApiProperty({ description: 'Target entity UUID.' })
  @IsString()
  @MaxLength(64)
  targetId!: string;

  @ApiProperty({ description: 'Rating (1-5).' })
  @IsInt()
  @Min(1)
  rating!: number;

  @ApiPropertyOptional({ description: 'Feedback title.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Comments.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comments?: string;

  @ApiPropertyOptional({ description: 'Whether feedback is anonymous.' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: 'Structured responses.' })
  @IsOptional()
  @IsObject()
  responsesJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Term UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  termId?: string;

}
