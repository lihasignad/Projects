import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransportVehicleDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Route UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  routeId?: string;

  @ApiProperty({ description: 'Vehicle registration number.' })
  @IsString()
  @MaxLength(32)
  registrationNo!: string;

  @ApiPropertyOptional({ description: 'Vehicle model.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiProperty({ description: 'Seating capacity.' })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ description: 'Driver name.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  driverName?: string;

  @ApiPropertyOptional({ description: 'Driver phone.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  driverPhone?: string;

  @ApiPropertyOptional({ description: 'Driver license number.' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  driverLicense?: string;

  @ApiPropertyOptional({ description: 'Insurance expiry date.' })
  @IsOptional()
  @IsDateString()
  insuranceExpiresOn?: string;

  @ApiPropertyOptional({ description: 'Pollution cert expiry.' })
  @IsOptional()
  @IsDateString()
  pollutionExpiresOn?: string;

  @ApiPropertyOptional({ description: 'Whether vehicle is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
