import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookIssueStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBookIssueDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Book copy UUID.', format: 'uuid' })
  @IsUUID()
  bookCopyId!: string;

  @ApiPropertyOptional({ description: 'Student UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'Borrower user UUID.', format: 'uuid' })
  @IsUUID()
  borrowerUserId!: string;

  @ApiProperty({ description: 'Due date for return.' })
  @IsDateString()
  dueAt!: string;

  @ApiPropertyOptional({ description: 'Issue status.', enum: BookIssueStatus })
  @IsOptional()
  @IsEnum(BookIssueStatus)
  status?: BookIssueStatus;

  @ApiProperty({ description: 'Issuing librarian UUID.', format: 'uuid' })
  @IsUUID()
  issuedByUserId!: string;

  @ApiPropertyOptional({ description: 'Notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

}
