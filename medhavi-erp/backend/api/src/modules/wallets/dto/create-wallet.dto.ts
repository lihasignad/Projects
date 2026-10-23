import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Student UUID (unique per student).', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Wallet balance.' })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({ description: 'Amount on hold.' })
  @IsOptional()
  @IsNumber()
  holdAmount?: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Wallet status.', enum: WalletStatus })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

}
