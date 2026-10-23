import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletTxnType } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWalletTransactionDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Wallet UUID.', format: 'uuid' })
  @IsUUID()
  walletId!: string;

  @ApiPropertyOptional({ description: 'Payment UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @ApiProperty({ description: 'Transaction type.', enum: WalletTxnType })
  @IsEnum(WalletTxnType)
  type!: WalletTxnType;

  @ApiProperty({ description: 'Transaction amount.' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Balance after transaction.' })
  @IsNumber()
  balanceAfter!: number;

  @ApiPropertyOptional({ description: 'Reference code.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;

  @ApiPropertyOptional({ description: 'Description.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Additional metadata.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'User who created the transaction.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

}
