import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GrantStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateGrantDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Research project UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Grant title.' })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiProperty({ description: 'Funding agency.' })
  @IsString()
  @MaxLength(255)
  fundingAgency!: string;

  @ApiPropertyOptional({ description: 'Scheme name.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  schemeName?: string;

  @ApiPropertyOptional({ description: 'Amount sanctioned.' })
  @IsOptional()
  @IsNumber()
  amountSanctioned?: number;

  @ApiPropertyOptional({ description: 'Amount released.' })
  @IsOptional()
  @IsNumber()
  amountReleased?: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Grant status.', enum: GrantStatus })
  @IsOptional()
  @IsEnum(GrantStatus)
  status?: GrantStatus;

  @ApiPropertyOptional({ description: 'Application date.' })
  @IsOptional()
  @IsDateString()
  appliedOn?: string;

  @ApiPropertyOptional({ description: 'Sanction date.' })
  @IsOptional()
  @IsDateString()
  sanctionedOn?: string;

  @ApiPropertyOptional({ description: 'Start date.' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date.' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'PI faculty UUID.', format: 'uuid' })
  @IsUUID()
  pifacultyId!: string;

  @ApiPropertyOptional({ description: 'Co-PI UUIDs.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coPis?: string[];

  @ApiPropertyOptional({ description: 'Reference number.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Documents data.' })
  @IsOptional()
  @IsObject()
  documentsJson?: Record<string, unknown>;

}
