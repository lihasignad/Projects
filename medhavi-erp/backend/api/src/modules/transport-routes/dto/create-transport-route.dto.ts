import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTransportRouteDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Unique route code.' })
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty({ description: 'Route name.' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Origin.' })
  @IsString()
  @MaxLength(200)
  origin!: string;

  @ApiProperty({ description: 'Destination.' })
  @IsString()
  @MaxLength(200)
  destination!: string;

  @ApiPropertyOptional({ description: 'Distance in km.' })
  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @ApiPropertyOptional({ description: 'Fee per term.' })
  @IsOptional()
  @IsNumber()
  feePerTerm?: number;

  @ApiPropertyOptional({ description: 'Whether route is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
