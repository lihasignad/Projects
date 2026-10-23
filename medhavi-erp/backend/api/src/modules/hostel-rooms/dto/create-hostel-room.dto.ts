import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHostelRoomDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Hostel UUID.', format: 'uuid' })
  @IsUUID()
  hostelId!: string;

  @ApiProperty({ description: 'Room number.' })
  @IsString()
  @MaxLength(32)
  roomNumber!: string;

  @ApiPropertyOptional({ description: 'Floor number.' })
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiProperty({ description: 'Room capacity.' })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ description: 'Currently occupied.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  occupied?: number;

  @ApiPropertyOptional({ description: 'Room type.' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  roomType?: string;

  @ApiPropertyOptional({ description: 'Monthly rent.' })
  @IsOptional()
  @IsNumber()
  monthlyRent?: number;

  @ApiPropertyOptional({ description: 'Whether room is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
