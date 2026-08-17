import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HallTicketStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateHallTicketDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() instituteId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() examId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() studentId!: string;
  @ApiProperty({ example: 'HT-2026-001' }) @IsString() @Length(1, 100) ticketNumber!: string;
  @ApiPropertyOptional({ enum: HallTicketStatus, default: HallTicketStatus.GENERATED }) @IsOptional() @IsEnum(HallTicketStatus) status?: HallTicketStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() qrPayload?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) issuedAt?: Date;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() fileObjectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() blockedReason?: string;
}
