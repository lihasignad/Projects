import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHallTicketDto } from './create-hall-ticket.dto';

export class UpdateHallTicketDto extends PartialType(
  OmitType(CreateHallTicketDto, ['instituteId', 'examId', 'studentId'] as const),
) {}
