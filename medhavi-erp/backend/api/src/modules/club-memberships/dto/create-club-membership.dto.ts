import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateClubMembershipDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Club UUID.', format: 'uuid' })
  @IsUUID()
  clubId!: string;

  @ApiProperty({ description: 'Student UUID.', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Membership role.' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string;

  @ApiPropertyOptional({ description: 'Whether membership is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
