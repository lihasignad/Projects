import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookReservationDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Book UUID.', format: 'uuid' })
  @IsUUID()
  bookId!: string;

  @ApiPropertyOptional({ description: 'Student UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'Reserver user UUID.', format: 'uuid' })
  @IsUUID()
  reservedByUserId!: string;

  @ApiProperty({ description: 'Reservation expiry.' })
  @IsDateString()
  expiresAt!: string;

  @ApiPropertyOptional({ description: 'Reservation status.', enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ description: 'Queue position.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  queuePosition?: number;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

}
