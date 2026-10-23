import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeStructureStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateFeeStructureDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Program UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiPropertyOptional({ description: 'Batch UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiProperty({ description: 'Academic year UUID.', format: 'uuid' })
  @IsUUID()
  academicYearId!: string;

  @ApiPropertyOptional({ description: 'Term UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  termId?: string;

  @ApiProperty({ description: 'Fee structure name.' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Total fee amount.' })
  @IsNumber()
  totalAmount!: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ description: 'Fee components breakdown.' })
  @IsObject()
  componentsJson!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Payment due date.' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Fee structure status.', enum: FeeStructureStatus })
  @IsOptional()
  @IsEnum(FeeStructureStatus)
  status?: FeeStructureStatus;

  @ApiProperty({ description: 'Effective start date.' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ description: 'Effective end date.' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

}
