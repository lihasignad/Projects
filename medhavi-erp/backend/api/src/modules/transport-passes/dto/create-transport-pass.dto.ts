import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransportPassStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTransportPassDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Route UUID.', format: 'uuid' })
  @IsUUID()
  routeId!: string;

  @ApiPropertyOptional({ description: 'Stop UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  stopId?: string;

  @ApiProperty({ description: 'Academic year UUID.', format: 'uuid' })
  @IsUUID()
  academicYearId!: string;

  @ApiProperty({ description: 'Unique pass number.' })
  @IsString()
  @MaxLength(64)
  passNumber!: string;

  @ApiProperty({ description: 'Valid from date.' })
  @IsDateString()
  validFrom!: string;

  @ApiProperty({ description: 'Valid to date.' })
  @IsDateString()
  validTo!: string;

  @ApiPropertyOptional({ description: 'Pass status.', enum: TransportPassStatus })
  @IsOptional()
  @IsEnum(TransportPassStatus)
  status?: TransportPassStatus;

  @ApiPropertyOptional({ description: 'Whether fee is paid.' })
  @IsOptional()
  @IsBoolean()
  feePaid?: boolean;

}
