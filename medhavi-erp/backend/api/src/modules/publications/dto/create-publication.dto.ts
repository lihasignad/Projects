import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicationType } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePublicationDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Research project UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Publication type.', enum: PublicationType })
  @IsEnum(PublicationType)
  type!: PublicationType;

  @ApiProperty({ description: 'Publication title.' })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({ description: 'Abstract.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  abstract?: string;

  @ApiProperty({ description: 'Author names.' })
  @IsArray()
  @IsString({ each: true })
  authors!: string[];

  @ApiPropertyOptional({ description: 'Primary author faculty UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  primaryAuthorFacultyId?: string;

  @ApiPropertyOptional({ description: 'Publication venue.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  venue?: string;

  @ApiPropertyOptional({ description: 'Publisher.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  publisher?: string;

  @ApiPropertyOptional({ description: 'DOI.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  doi?: string;

  @ApiPropertyOptional({ description: 'ISBN.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional({ description: 'ISSN.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  issn?: string;

  @ApiPropertyOptional({ description: 'Volume.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  volume?: string;

  @ApiPropertyOptional({ description: 'Issue.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  issue?: string;

  @ApiPropertyOptional({ description: 'Start page.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pageStart?: string;

  @ApiPropertyOptional({ description: 'End page.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pageEnd?: string;

  @ApiPropertyOptional({ description: 'Publication date.' })
  @IsOptional()
  @IsDateString()
  publishedOn?: string;

  @ApiPropertyOptional({ description: 'Indexing details.' })
  @IsOptional()
  @IsObject()
  indexingJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Impact factor.' })
  @IsOptional()
  @IsNumber()
  impactFactor?: number;

  @ApiPropertyOptional({ description: 'Citation count.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  citationCount?: number;

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
