import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType, OfferStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePlacementOfferDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Drive UUID.', format: 'uuid' })
  @IsUUID()
  driveId!: string;

  @ApiProperty({ description: 'Application UUID.', format: 'uuid' })
  @IsUUID()
  applicationId!: string;

  @ApiProperty({ description: 'Company UUID.', format: 'uuid' })
  @IsUUID()
  companyId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Offer type.', enum: OfferType })
  @IsEnum(OfferType)
  type!: OfferType;

  @ApiPropertyOptional({ description: 'Offer status.', enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiProperty({ description: 'Job role.' })
  @IsString()
  @MaxLength(200)
  jobRole!: string;

  @ApiProperty({ description: 'Cost to company.' })
  @IsNumber()
  ctc!: number;

  @ApiPropertyOptional({ description: 'Base salary.' })
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @ApiPropertyOptional({ description: 'Stipend amount.' })
  @IsOptional()
  @IsNumber()
  stipend?: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Job location.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Joining date.' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({ description: 'Offer letter file UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  offerLetterFileObjectId?: string;

  @ApiPropertyOptional({ description: 'Response deadline.' })
  @IsOptional()
  @IsDateString()
  responseDeadline?: string;

  @ApiPropertyOptional({ description: 'Whether primary offer.' })
  @IsOptional()
  @IsBoolean()
  isPrimaryOffer?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

}
