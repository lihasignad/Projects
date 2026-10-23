import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBookReservationDto } from './create-book-reservation.dto';

export class UpdateBookReservationDto extends PartialType(
  OmitType(CreateBookReservationDto, ['instituteId'] as const),
) {}
