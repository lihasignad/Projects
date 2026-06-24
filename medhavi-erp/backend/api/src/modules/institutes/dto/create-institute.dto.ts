import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstituteStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInstituteDto {
  @ApiProperty({ example: 'MEDHAVI', description: 'Unique short code', maxLength: 32 })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  @Matches(/^[A-Z0-9_-]+$/, { message: 'code must be uppercase alphanumeric, _ or -' })
  code!: string;

  @ApiProperty({ example: 'Medhavi Skills University' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'Medhavi Skills University Trust' })
  @IsOptional() @IsString() @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({ example: 'medhavi.edu.in' })
  @IsOptional() @IsString() @MaxLength(255)
  @Matches(/^[a-z0-9.-]+\.[a-z]{2,}$/i, { message: 'domain must be a valid hostname' })
  domain?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional() @IsString() @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({ example: 'en-IN' })
  @IsOptional() @IsString() @MaxLength(16)
  locale?: string;

  @ApiPropertyOptional({ enum: InstituteStatus, example: InstituteStatus.ACTIVE })
  @IsOptional() @IsEnum(InstituteStatus)
  status?: InstituteStatus;

  @ApiPropertyOptional({ example: 'contact@medhavi.edu.in' })
  @IsOptional() @IsEmail() @MaxLength(255)
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+91-9999999999' })
  @IsOptional() @IsString() @MaxLength(32)
  contactPhone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  addressLine2?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120)
  city?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120)
  state?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120)
  country?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Free-form JSON metadata' })
  @IsOptional() @IsObject()
  metadata?: Record<string, unknown>;
}
