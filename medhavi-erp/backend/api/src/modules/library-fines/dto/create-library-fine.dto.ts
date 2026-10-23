import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateLibraryFineDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Book issue UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  bookIssueId?: string;

  @ApiPropertyOptional({ description: 'Student UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'User UUID.', format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Fine amount.' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Reason for fine.' })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ description: 'Whether fine is paid.' })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

}
