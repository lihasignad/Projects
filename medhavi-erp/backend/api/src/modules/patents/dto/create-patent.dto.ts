import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatentStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePatentDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Research project UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Patent title.' })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({ description: 'Abstract.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  abstract?: string;

  @ApiPropertyOptional({ description: 'Inventor names.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inventors?: string[];

  @ApiPropertyOptional({ description: 'Primary inventor faculty UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  primaryInventorFacultyId?: string;

  @ApiPropertyOptional({ description: 'Application number.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  applicationNumber?: string;

  @ApiPropertyOptional({ description: 'Patent number.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  patentNumber?: string;

  @ApiPropertyOptional({ description: 'Patent status.', enum: PatentStatus })
  @IsOptional()
  @IsEnum(PatentStatus)
  status?: PatentStatus;

  @ApiPropertyOptional({ description: 'Jurisdiction.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jurisdiction?: string;

  @ApiPropertyOptional({ description: 'Filing date.' })
  @IsOptional()
  @IsDateString()
  filedOn?: string;

  @ApiPropertyOptional({ description: 'Publication date.' })
  @IsOptional()
  @IsDateString()
  publishedOn?: string;

  @ApiPropertyOptional({ description: 'Grant date.' })
  @IsOptional()
  @IsDateString()
  grantedOn?: string;

  @ApiPropertyOptional({ description: 'Expiry date.' })
  @IsOptional()
  @IsDateString()
  expiresOn?: string;

  @ApiPropertyOptional({ description: 'Classification.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  classification?: string;

  @ApiPropertyOptional({ description: 'URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @ApiPropertyOptional({ description: 'File object UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  fileObjectId?: string;

}
