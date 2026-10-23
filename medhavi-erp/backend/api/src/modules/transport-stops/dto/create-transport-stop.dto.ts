import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransportStopDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Route UUID.', format: 'uuid' })
  @IsUUID()
  routeId!: string;

  @ApiProperty({ description: 'Stop name.' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: 'Stop sequence order.' })
  @IsInt()
  @Min(0)
  sequence!: number;

  @ApiPropertyOptional({ description: 'Pickup time (HH:mm).' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pickupTime?: string;

  @ApiPropertyOptional({ description: 'Drop time (HH:mm).' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dropTime?: string;

  @ApiPropertyOptional({ description: 'Latitude.' })
  @IsOptional()
  @IsNumber()
  geoLat?: number;

  @ApiPropertyOptional({ description: 'Longitude.' })
  @IsOptional()
  @IsNumber()
  geoLng?: number;

}
