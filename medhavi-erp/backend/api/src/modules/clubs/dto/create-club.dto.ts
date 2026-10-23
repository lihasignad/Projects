import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateClubDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Unique club code.' })
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty({ description: 'Club name.' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Club category.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Faculty advisor UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  facultyAdvisorFacultyId?: string;

  @ApiPropertyOptional({ description: 'President user UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  presidentUserId?: string;

  @ApiPropertyOptional({ description: 'Founded date.' })
  @IsOptional()
  @IsDateString()
  foundedOn?: string;

  @ApiPropertyOptional({ description: 'Logo URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Whether club is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
