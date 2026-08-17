import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LabType } from '@prisma/client';
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

export class CreateLabDto {
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

  @ApiProperty({ description: 'Unique lab code within institute.', example: 'CS-LAB-01' })
  @IsString()
  @Length(1, 32)
  code!: string;

  @ApiProperty({ description: 'Lab name.', example: 'Advanced Computing Lab' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ enum: LabType, default: LabType.COMPUTER_LAB })
  @IsEnum(LabType)
  type!: LabType;

  @ApiProperty({ description: 'Workstation/seating capacity.', minimum: 1 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Equipment inventory JSON.' })
  @IsOptional()
  @IsObject()
  equipment?: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
