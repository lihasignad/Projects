import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanySize, CompanyStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Company name.' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ description: 'Legal name.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({ description: 'Website URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ description: 'Industry.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Company size.', enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize;

  @ApiPropertyOptional({ description: 'HQ location.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hqLocation?: string;

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Company status.', enum: CompanyStatus })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @ApiPropertyOptional({ description: 'Primary contact name.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  primaryContactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  primaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  primaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'MOU signing date.' })
  @IsOptional()
  @IsDateString()
  mouSignedAt?: string;

  @ApiPropertyOptional({ description: 'Blacklist reason.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  blacklistReason?: string;

  @ApiPropertyOptional({ description: 'Additional metadata.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

}
