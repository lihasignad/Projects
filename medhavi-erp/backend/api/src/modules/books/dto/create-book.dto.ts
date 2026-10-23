import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'ISBN.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiProperty({ description: 'Book title.' })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({ description: 'Subtitle.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Author names.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];

  @ApiPropertyOptional({ description: 'Publisher.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  publisher?: string;

  @ApiPropertyOptional({ description: 'Edition.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  edition?: string;

  @ApiPropertyOptional({ description: 'Publication year.' })
  @IsOptional()
  @IsInt()
  @Min(1000)
  publishYear?: number;

  @ApiPropertyOptional({ description: 'Language.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @ApiPropertyOptional({ description: 'Category.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Subject tags.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Cover image URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @ApiPropertyOptional({ description: 'Total copies.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCopies?: number;

  @ApiPropertyOptional({ description: 'Available copies.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  availableCopies?: number;

}
