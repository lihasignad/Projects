import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateType, CertificateStatus } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Certificate type.', enum: CertificateType })
  @IsEnum(CertificateType)
  type!: CertificateType;

  @ApiPropertyOptional({ description: 'Certificate status.', enum: CertificateStatus })
  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: CertificateStatus;

  @ApiPropertyOptional({ description: 'Unique certificate number.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  certificateNumber?: string;

  @ApiPropertyOptional({ description: 'Verification code.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  verificationCode?: string;

  @ApiPropertyOptional({ description: 'Purpose of certificate.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  purpose?: string;

  @ApiPropertyOptional({ description: 'Generated file UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  fileObjectId?: string;

  @ApiPropertyOptional({ description: 'Rejection reason.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectedReason?: string;

  @ApiPropertyOptional({ description: 'Certificate payload data.' })
  @IsOptional()
  @IsObject()
  payloadJson?: Record<string, unknown>;

}
