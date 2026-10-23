import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
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

export class CreatePaymentDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Invoice UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Unique payment number.' })
  @IsString()
  @MaxLength(64)
  paymentNumber!: string;

  @ApiProperty({ description: 'Payment method.', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment status.', enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ description: 'Payment amount.' })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Payment gateway name.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  gatewayName?: string;

  @ApiPropertyOptional({ description: 'Gateway transaction ID.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayTxnId?: string;

  @ApiPropertyOptional({ description: 'Gateway response payload.' })
  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Date payment was made.' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ description: 'Date of refund.' })
  @IsOptional()
  @IsDateString()
  refundedAt?: string;

  @ApiPropertyOptional({ description: 'Refund amount.' })
  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @ApiPropertyOptional({ description: 'Receipt download URL.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  receiptUrl?: string;

  @ApiPropertyOptional({ description: 'User who received payment.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  receivedByUserId?: string;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

}
