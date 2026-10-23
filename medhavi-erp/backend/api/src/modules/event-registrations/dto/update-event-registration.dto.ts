import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEventRegistrationDto } from './create-event-registration.dto';

export class UpdateEventRegistrationDto extends PartialType(
  OmitType(CreateEventRegistrationDto, ['instituteId'] as const),
) {}
