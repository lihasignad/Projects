import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import {
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

export class CreateEventDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Club UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiProperty({ description: 'Organizer user UUID.', format: 'uuid' })
  @IsUUID()
  organizerUserId!: string;

  @ApiProperty({ description: 'Event title.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Event category.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ description: 'Event start datetime.' })
  @IsDateString()
  startAt!: string;

  @ApiProperty({ description: 'Event end datetime.' })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({ description: 'Venue.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  venue?: string;

  @ApiPropertyOptional({ description: 'Event status.', enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Registration opens.' })
  @IsOptional()
  @IsDateString()
  registrationOpensAt?: string;

  @ApiPropertyOptional({ description: 'Registration closes.' })
  @IsOptional()
  @IsDateString()
  registrationClosesAt?: string;

  @ApiPropertyOptional({ description: 'Max capacity.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Registration fee.' })
  @IsOptional()
  @IsNumber()
  feeAmount?: number;

  @ApiPropertyOptional({ description: 'Banner image URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

}
