import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HostelType } from '@prisma/client';
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

export class CreateHostelDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Campus UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  campusId?: string;

  @ApiProperty({ description: 'Unique hostel code.' })
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty({ description: 'Hostel name.' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Hostel type.', enum: HostelType })
  @IsEnum(HostelType)
  type!: HostelType;

  @ApiPropertyOptional({ description: 'Total rooms.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalRooms?: number;

  @ApiPropertyOptional({ description: 'Total beds.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalBeds?: number;

  @ApiPropertyOptional({ description: 'Warden user UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  wardenUserId?: string;

  @ApiPropertyOptional({ description: 'Address.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Amenities data.' })
  @IsOptional()
  @IsObject()
  amenitiesJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Whether hostel is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
