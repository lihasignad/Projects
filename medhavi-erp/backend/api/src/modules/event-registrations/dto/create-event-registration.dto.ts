import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateEventRegistrationDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Event UUID.', format: 'uuid' })
  @IsUUID()
  eventId!: string;

  @ApiPropertyOptional({ description: 'Student UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'User UUID.', format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({ description: 'Whether fee is paid.' })
  @IsOptional()
  @IsBoolean()
  feePaid?: boolean;

}
