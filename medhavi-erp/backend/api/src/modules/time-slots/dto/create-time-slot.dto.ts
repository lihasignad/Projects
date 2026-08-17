import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Slot display name.', example: 'Period 1' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ description: 'Start time in HH:mm format.', example: '09:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format (24-hour).',
  })
  startTime!: string;

  @ApiProperty({ description: 'End time in HH:mm format.', example: '09:50' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format (24-hour).',
  })
  endTime!: string;

  @ApiProperty({ description: 'Duration in minutes.', minimum: 1, example: 50 })
  @IsInt()
  @Min(1)
  durationMin!: number;

  @ApiProperty({ description: 'Order sequence number in day schedule.', minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  slotOrder!: number;

  @ApiPropertyOptional({ default: false, description: 'True if this slot is a break/lunch.' })
  @IsOptional()
  @IsBoolean()
  isBreak?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
