import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBookCopyDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Book UUID.', format: 'uuid' })
  @IsUUID()
  bookId!: string;

  @ApiProperty({ description: 'Unique accession number.' })
  @IsString()
  @MaxLength(64)
  accessionNo!: string;

  @ApiPropertyOptional({ description: 'Shelf location.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  shelfLocation?: string;

  @ApiPropertyOptional({ description: 'Date acquired.' })
  @IsOptional()
  @IsDateString()
  acquiredOn?: string;

  @ApiPropertyOptional({ description: 'Purchase price.' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Copy status.', enum: BookStatus })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

}
