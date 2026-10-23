import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateHelpCenterArticleDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Article category.' })
  @IsString()
  @MaxLength(100)
  category!: string;

  @ApiProperty({ description: 'URL-friendly slug.' })
  @IsString()
  @MaxLength(200)
  slug!: string;

  @ApiProperty({ description: 'Article title.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ description: 'Markdown body content.' })
  @IsString()
  @MaxLength(50000)
  bodyMarkdown!: string;

  @ApiPropertyOptional({ description: 'Tags.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether published.' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Author user UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  authorUserId?: string;

}
