import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Campus UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  campusId?: string;

  @ApiPropertyOptional({ description: 'Building name or block.', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  building?: string;

  @ApiProperty({ description: 'Unique room code within institute.', example: 'LH-101' })
  @IsString()
  @Length(1, 32)
  code!: string;

  @ApiProperty({ description: 'Room name.', example: 'Lecture Hall 101' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ enum: RoomType, default: RoomType.CLASSROOM })
  @IsEnum(RoomType)
  type!: RoomType;

  @ApiProperty({ description: 'Seating capacity.', minimum: 1 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ description: 'Floor number.' })
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasProjector?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasAc?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
