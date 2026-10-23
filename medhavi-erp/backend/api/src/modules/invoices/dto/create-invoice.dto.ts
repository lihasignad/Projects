import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';
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

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Fee structure UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  feeStructureId?: string;

  @ApiPropertyOptional({ description: 'Term UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  termId?: string;

  @ApiProperty({ description: 'Unique invoice number.' })
  @IsString()
  @MaxLength(64)
  invoiceNumber!: string;

  @ApiPropertyOptional({ description: 'Invoice status.', enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ description: 'Sub total amount.' })
  @IsNumber()
  subTotal!: number;

  @ApiPropertyOptional({ description: 'Discount total.' })
  @IsOptional()
  @IsNumber()
  discountTotal?: number;

  @ApiPropertyOptional({ description: 'Tax total.' })
  @IsOptional()
  @IsNumber()
  taxTotal?: number;

  @ApiProperty({ description: 'Grand total.' })
  @IsNumber()
  grandTotal!: number;

  @ApiPropertyOptional({ description: 'Amount paid so far.' })
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @ApiProperty({ description: 'Amount due.' })
  @IsNumber()
  amountDue!: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Date invoice was issued.' })
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional({ description: 'Payment due date.' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Invoice line items.' })
  @IsObject()
  lineItemsJson!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

}
