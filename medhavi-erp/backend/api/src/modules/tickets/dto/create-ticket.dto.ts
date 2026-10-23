import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Unique ticket number.' })
  @IsString()
  @MaxLength(64)
  ticketNumber!: string;

  @ApiProperty({ description: 'User who raised the ticket.', format: 'uuid' })
  @IsUUID()
  raisedByUserId!: string;

  @ApiPropertyOptional({ description: 'Related student UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'Ticket category.', enum: TicketCategory })
  @IsEnum(TicketCategory)
  category!: TicketCategory;

  @ApiPropertyOptional({ description: 'Ticket priority.', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'Ticket status.', enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({ description: 'Ticket subject.' })
  @IsString()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({ description: 'Ticket description.' })
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({ description: 'Assigned agent UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @ApiPropertyOptional({ description: 'Resolution text.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  resolutionText?: string;

  @ApiPropertyOptional({ description: 'Attachments.' })
  @IsOptional()
  @IsObject()
  attachmentsJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Conversation thread.' })
  @IsOptional()
  @IsObject()
  threadJson?: Record<string, unknown>;

}
