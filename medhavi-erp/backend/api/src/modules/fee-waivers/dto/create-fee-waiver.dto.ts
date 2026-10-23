import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WaiverStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateFeeWaiverDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Invoice UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ description: 'Waiver amount.' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Reason for waiver.' })
  @IsString()
  @MaxLength(1000)
  reason!: string;

  @ApiPropertyOptional({ description: 'Waiver status.', enum: WaiverStatus })
  @IsOptional()
  @IsEnum(WaiverStatus)
  status?: WaiverStatus;

  @ApiProperty({ description: 'User who requested the waiver.', format: 'uuid' })
  @IsUUID()
  requestedByUserId!: string;

  @ApiPropertyOptional({ description: 'User who approved the waiver.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  approvedByUserId?: string;

  @ApiPropertyOptional({ description: 'Approval date.' })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiPropertyOptional({ description: 'Remarks.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;

}
